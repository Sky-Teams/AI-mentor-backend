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
        StatusCodes.NOT_FOUND,
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
      const specialty = await this.prisma.journalSpecialty.findUnique({
        where: { id: input.specialtyId },
      });

      if (!specialty)
        throw new AppError(
          "Specialty not found",
          StatusCodes.NOT_FOUND,
          "SPECIALTY_NOT_FOUND",
        );

      // Create journal
      return transaction.journal.create({
        data: {
          name: input.name,
          publisher: input.publisher,
          description: input.description,
          guidelinePackId: guidelinePack.id,
          specialtyId: specialty.id,
          sectionTemplates: {
            create: input.sections.map((section) => ({
              key: section.key,
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
            include: { checklists: true },
          },
          specialty: true,
        },
      });
    });

    return mapJournal(journal);
  }
}
