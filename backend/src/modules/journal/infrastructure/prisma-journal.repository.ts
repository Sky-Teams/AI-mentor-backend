import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import {
  CreatedJournal,
  CreateJournalInput,
  JournalRepository,
  JournalSectionDefinition,
  UpdateJournalInput,
  UpdateJournalSectionDefinition,
  UpdateSectionChecklistsGroup,
} from "src/modules/journal/domain/journal.repository.js";
import { AppError } from "src/shared/errors/app-error.js";

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

  public async findAll(
    specialtyId?: string,
  ): Promise<Array<{ id: string; name: string }>> {
    return this.prisma.journal.findMany({
      where: specialtyId ? { specialtyId: specialtyId } : {},
    });
  }

  public async findById(id: string): Promise<CreatedJournal | null> {
    const journal = await this.prisma.journal.findUnique({
      where: { id },
      include: {
        guidelinePack: true,
        specialty: true,
        sectionTemplates: {
          where: { parentSectionId: null },
          include: {
            checklists: true,
            subsections: {
              include: { checklists: true },
            },
          },
        },
      },
    });

    return journal ? mapJournal(journal) : null;
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

  private async syncSectionChecklists(
    transaction: Prisma.TransactionClient,
    sectionId: string,
    checklists?: UpdateSectionChecklistsGroup[],
  ) {
    if (checklists === undefined) return;

    const updatedChecklists = checklists.filter((checklist) => checklist.id);
    const newChecklists = checklists.filter((checklist) => !checklist.id);

    for (const checklist of updatedChecklists) {
      await transaction.sectionChecklist.update({
        where: { id: checklist.id! },
        data: {
          ...(checklist.title !== undefined && { title: checklist.title }),
          ...(checklist.items !== undefined && { items: checklist.items }),
        },
      });
    }

    if (newChecklists.length > 0) {
      await transaction.sectionChecklist.createMany({
        data: newChecklists.map((checklist) => ({
          journalSectionTemplateId: sectionId,
          title: checklist.title,
          items: checklist.items ?? [],
        })),
      });
    }

    const updatedChecklistIds = updatedChecklists
      .filter(
        (
          checklist,
        ): checklist is UpdateSectionChecklistsGroup & { id: string } =>
          Boolean(checklist.id),
      )
      .map((checklist) => checklist.id);

    await transaction.sectionChecklist.deleteMany({
      where: {
        journalSectionTemplateId: sectionId,
        id: {
          notIn:
            updatedChecklistIds.length > 0 ? updatedChecklistIds : undefined,
        },
      },
    });
  }

  private async syncSubsections(
    transaction: Prisma.TransactionClient,
    journalId: string,
    parentSectionId: string,
    subsections?: UpdateJournalSectionDefinition[],
  ) {
    if (subsections === undefined) return;

    const existingSubsections =
      await transaction.journalSectionTemplate.findMany({
        where: { parentSectionId },
      });

    const updatedSubsections = subsections.filter((sub) => sub.id);
    const newSubsections = subsections.filter((sub) => !sub.id);
    const updatedSubsectionIds = updatedSubsections.map((sub) => sub.id!);

    if (updatedSubsectionIds.length > 0) {
      await transaction.journalSectionTemplate.deleteMany({
        where: {
          parentSectionId,
          id: { notIn: updatedSubsectionIds },
        },
      });
    } else if (existingSubsections.length > 0) {
      await transaction.journalSectionTemplate.deleteMany({
        where: { parentSectionId },
      });
    }

    for (const subsection of updatedSubsections) {
      const sectionData: any = {};
      if (subsection.title !== undefined) sectionData.title = subsection.title;
      if (subsection.sectionOrder !== undefined)
        sectionData.sectionOrder = subsection.sectionOrder;
      if (subsection.isOptional !== undefined)
        sectionData.isOptional = subsection.isOptional;
      if (subsection.description !== undefined)
        sectionData.description = subsection.description;
      if (subsection.maxChars !== undefined)
        sectionData.maxChars = subsection.maxChars;

      if (Object.keys(sectionData).length > 0) {
        await transaction.journalSectionTemplate.update({
          where: { id: subsection.id! },
          data: sectionData,
        });
      }

      await this.syncSectionChecklists(
        transaction,
        subsection.id!,
        subsection.checklists,
      );
    }

    for (const subsection of newSubsections) {
      const createdSubsection = await transaction.journalSectionTemplate.create(
        {
          data: {
            journalId,
            parentSectionId,
            key:
              (subsection.title ?? "subsection") +
              Math.floor(Math.random() * 900 + 1000),
            title: subsection.title ?? "",
            sectionOrder: subsection.sectionOrder ?? 0,
            isOptional: subsection.isOptional ?? false,
            maxChars: subsection.maxChars ?? 0,
            description: subsection.description,
            checklists: subsection.checklists
              ? {
                  create: subsection.checklists.map((checklist) => ({
                    title: checklist.title,
                    items: checklist.items ?? [],
                  })),
                }
              : undefined,
          },
        },
      );

      if (subsection.subsections) {
        await this.syncSubsections(
          transaction,
          journalId,
          createdSubsection.id,
          subsection.subsections,
        );
      }
    }
  }

  private async syncSections(
    transaction: Prisma.TransactionClient,
    journalId: string,
    sections: UpdateJournalSectionDefinition[],
  ) {
    const existingSections = await transaction.journalSectionTemplate.findMany({
      where: { journalId, parentSectionId: null },
    });

    const updatedSections = sections.filter((section) => section.id);
    const newSections = sections.filter((section) => !section.id);
    const updatedSectionIds = updatedSections.map((section) => section.id!);

    if (updatedSectionIds.length > 0) {
      await transaction.journalSectionTemplate.deleteMany({
        where: {
          journalId,
          parentSectionId: null,
          id: { notIn: updatedSectionIds },
        },
      });
    } else if (existingSections.length > 0) {
      await transaction.journalSectionTemplate.deleteMany({
        where: { journalId, parentSectionId: null },
      });
    }

    for (const section of updatedSections) {
      const sectionData: any = {};
      if (section.title !== undefined) sectionData.title = section.title;
      if (section.sectionOrder !== undefined)
        sectionData.sectionOrder = section.sectionOrder;
      if (section.isOptional !== undefined)
        sectionData.isOptional = section.isOptional;
      if (section.description !== undefined)
        sectionData.description = section.description;
      if (section.maxChars !== undefined)
        sectionData.maxChars = section.maxChars;

      if (Object.keys(sectionData).length > 0) {
        await transaction.journalSectionTemplate.update({
          where: { id: section.id! },
          data: sectionData,
        });
      }

      await this.syncSectionChecklists(
        transaction,
        section.id!,
        section.checklists,
      );
      await this.syncSubsections(
        transaction,
        journalId,
        section.id!,
        section.subsections,
      );
    }

    for (const section of newSections) {
      const createdSection = await transaction.journalSectionTemplate.create({
        data: {
          journalId,
          key:
            (section.title ?? "section") +
            Math.floor(Math.random() * 900 + 100),
          title: section.title ?? "",
          sectionOrder: section.sectionOrder ?? 0,
          isOptional: section.isOptional ?? false,
          maxChars: section.maxChars ?? 0,
          description: section.description,
          checklists: section.checklists
            ? {
                create: section.checklists.map((checklist) => ({
                  title: checklist.title,
                  items: checklist.items ?? [],
                })),
              }
            : undefined,
        },
      });

      await this.syncSubsections(
        transaction,
        journalId,
        createdSection.id,
        section.subsections,
      );
    }
  }

  public async updateJournal(journalId: string, input: UpdateJournalInput) {
    const journal = await this.prisma.journal.findUnique({
      where: { id: journalId },
      include: {
        guidelinePack: true,
      },
    });

    if (!journal) {
      throw new AppError(
        "Journal not found",
        StatusCodes.NOT_FOUND,
        "JOURNAL_NOT_FOUND",
      );
    }

    return this.prisma.$transaction(async (transaction) => {
      const journalUpdateData: any = {};
      if (input.name !== undefined) journalUpdateData.name = input.name;
      if (input.publisher !== undefined)
        journalUpdateData.publisher = input.publisher;
      if (input.description !== undefined)
        journalUpdateData.description = input.description;
      if (input.specialtyId !== undefined)
        journalUpdateData.specialtyId = input.specialtyId;

      if (input.specialtyId !== undefined) {
        const specialty = await transaction.journalSpecialty.findUnique({
          where: { id: input.specialtyId },
        });

        if (!specialty) {
          throw new AppError(
            "Specialty not found",
            StatusCodes.NOT_FOUND,
            "SPECIALTY_NOT_FOUND",
          );
        }
      }

      if (Object.keys(journalUpdateData).length > 0) {
        await transaction.journal.update({
          where: { id: journalId },
          data: journalUpdateData,
        });
      }

      if (input.guidelinePack !== undefined) {
        await transaction.guidelinePack.update({
          where: { id: journal.guidelinePackId },
          data: {
            rules: {
              text: input.guidelinePack,
            },
          },
        });
      }

      if (input.sections !== undefined) {
        await this.syncSections(transaction, journalId, input.sections);
      }

      const updatedJournal = await transaction.journal.findUniqueOrThrow({
        where: { id: journalId },
        include: {
          guidelinePack: true,
          specialty: true,
          sectionTemplates: {
            where: { parentSectionId: null },
            include: {
              checklists: true,
              subsections: {
                include: {
                  checklists: true,
                },
              },
            },
          },
        },
      });

      return mapJournal(updatedJournal);
    });
  }
}

// The pattern used everywhere:
// has ID  →  update
// no ID   →  create (new)
// missing →  delete
