import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import {
  CreatedJournal,
  JournalRepository,
  Specialty,
} from "src/modules/journal/domain/journal.repository.js";
import { AppError } from "src/shared/errors/app-error.js";
import { CreateJournalInput } from "src/shared/seed-data/journals.js";

const mapJournal = (journal: any): CreatedJournal => ({
  id: journal.id,
  name: journal.name,
  publisher: journal.publisher,
  description: journal.description,
  manuscriptType: journal.manuscriptType,
  guidelinePack: {
    id: journal.guidelinePack.id,
    rules: journal.guidelinePack.rules,
  },
  specialty: {
    id: journal.specialty.id,
    name: journal.specialty.name,
  },
  createdAt: journal.createdAt,
  updatedAt: journal.updatedAt,
  sections: journal.sectionTemplates.map((section: any) => ({
    id: section.id,
    journalId: section.journalId,
    key: section.key,
    title: section.title,
    sectionOrder: section.sectionOrder,
    isOptional: section.isOptional,
    maxChars: section.maxChars,
    description: section.description,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
    checklists: section.checklists.map((checklist: any) => ({
      id: checklist.id,
      title: checklist.title,
      items: checklist.items,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
    })),
    subsections:
      section.subsections?.map((sub: any) => ({
        id: sub.id,
        key: sub.key,
        title: sub.title,
        sectionOrder: sub.sectionOrder,
        isOptional: sub.isOptional,
        maxChars: sub.maxChars,
        description: sub.description,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        checklists:
          sub.checklists?.map((checklist: any) => ({
            id: checklist.id,
            title: checklist.title,
            items: checklist.items,
            createdAt: checklist.createdAt,
            updatedAt: checklist.updatedAt,
          })) ?? [],
      })) ?? [],
  })),
});

export class PrismaJournalRepository implements JournalRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findAll(): Promise<Array<{ id: string; name: string }>> {
    return this.prisma.journal.findMany();
  }

  public async findById(
    id: string,
  ): Promise<{ id: string; name: string } | null> {
    return this.prisma.journal.findFirst({
      where: { id },
    });
  }

  public async createJournal(
    input: CreateJournalInput,
  ): Promise<CreatedJournal> {
    const existing = await this.prisma.journal.findFirst({
      where: { name: input.name },
    });

    if (existing)
      throw new AppError(
        "Journal with this name already exists",
        StatusCodes.CONFLICT,
        "JOURNAL_ALREADY_EXISTS",
      );

    const journal = await this.prisma.$transaction(async (transaction) => {
      // Find guidelinePack
      const guidelinePack = await transaction.guidelinePack.create({
        data: {
          name: `${input.name} Guideline Pack`,
          version: "1.0.0",
          status: "ACTIVE",
          rules: { text: input.guidelinePack },
        },
      });

      // Find specialties
      const specialty = await transaction.journalSpecialty.findUnique({
        where: { id: input.specialtyId },
      });

      if (!specialty)
        throw new AppError(
          "Specialty not found",
          StatusCodes.NOT_FOUND,
          "SPECIALTY_NOT_FOUND",
        );

      // Create journal with main sections
      const journal = await transaction.journal.create({
        data: {
          name: input.name,
          publisher: input.publisher,
          description: input.description,
          guidelinePackId: guidelinePack.id,
          manuscriptType: input.manuscriptType || "CASE_REPORT",
          specialtyId: specialty.id,
          sectionTemplates: {
            create: input.sections.map((section) => ({
              key: section.title + Math.floor(Math.random() * 900 + 100),
              title: section.title,
              sectionOrder: section.sectionOrder,
              isOptional: section.isOptional,
              maxChars: section.maxChars,
              description: section.description,
              checklists: {
                create: section.checklists.map((checklist) => ({
                  title: checklist.title,
                  items: checklist.items,
                })),
              },
            })),
          },
        },
        include: {
          guidelinePack: true,
          sectionTemplates: {
            where: { parentSectionId: null },
            include: {
              checklists: true,
              subsections: {
                include: { checklists: true },
              },
            },
          },
          specialty: true,
        },
      });

      for (const section of input.sections) {
        if (!section.subsections || section.subsections.length === 0) continue;

        // find the created parent section
        const parentSection = journal.sectionTemplates.find(
          (sec) => sec.title === section.title,
        );

        if (!parentSection) continue;

        for (const sub of section.subsections) {
          const createdSub = await transaction.journalSectionTemplate.create({
            data: {
              journalId: journal.id,
              parentSectionId: parentSection.id,
              key: sub.title + Math.floor(Math.random() * 900 + 1000),
              title: sub.title,
              sectionOrder: sub.sectionOrder,
              isOptional: sub.isOptional,
              maxChars: sub.maxChars,
              description: sub.description,
            },
          });

          if (sub.checklists?.length) {
            await transaction.sectionChecklist.createMany({
              data: sub.checklists.map((checklist) => ({
                journalSectionTemplateId: createdSub.id,
                title: checklist.title,
                items: checklist.items,
              })),
            });
          }
        }
      }

      return transaction.journal.findUniqueOrThrow({
        where: { id: journal.id },
        include: {
          guidelinePack: true,
          sectionTemplates: {
            where: { parentSectionId: null },
            include: {
              checklists: true,
              subsections: {
                include: { checklists: true },
              },
            },
          },
          specialty: true,
        },
      });
    });

    return mapJournal(journal);
  }

  public async getAllSpecialties(): Promise<Specialty[]> {
    return await this.prisma.journalSpecialty.findMany();
  }
}
