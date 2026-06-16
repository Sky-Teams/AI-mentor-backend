import { PrismaClient, type Prisma } from "@prisma/client";
import type {
  Project,
  ProjectSection,
  SectionVersion,
} from "../domain/project";
import type {
  CreateProjectInput,
  ProjectRepository,
  UpdateProjectInput,
  UpdateSectionInput,
} from "../domain/project.repository";
import { AppError } from "src/shared/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

const mapSection = (section: {
  id: string;
  projectId: string;
  key: ProjectSection["key"];
  title: string;
  content: string;
  sectionOrder: number;
  isOptional: boolean;
  maxChars: number;
  status: ProjectSection["status"];
  lastEditedAt: Date | null;
  updatedAt: Date;
}): ProjectSection => ({
  id: section.id,
  projectId: section.projectId,
  key: section.key,
  maxChars: section.maxChars,
  title: section.title,
  content: section.content,
  sectionOrder: section.sectionOrder,
  isOptional: section.isOptional,
  status: section.status,
  lastEditedAt: section.lastEditedAt,
  updatedAt: section.updatedAt,
});

const mapProject = (project: {
  id: string;
  ownerId: string;
  manuscriptType: "CASE_REPORT";
  title: string;
  status: Project["status"];
  targetJournal: string | null;
  journal: {
    guidelinePack?: {
      id: string;
      rules: Prisma.JsonValue | null;
    } | null;
  } | null;
  metadata: unknown;
  readinessScore: number | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sections?: Array<{
    id: string;
    projectId: string;
    key: ProjectSection["key"];
    title: string;
    content: string;
    sectionOrder: number;
    isOptional: boolean;
    maxChars: number;
    status: ProjectSection["status"];
    lastEditedAt: Date | null;
    updatedAt: Date;
  }>;
}): Project => ({
  id: project.id,
  ownerId: project.ownerId,
  journal: project.journal
    ? {
        guidelinePack: project.journal.guidelinePack
          ? {
              id: project.journal.guidelinePack.id,
              rules: project.journal.guidelinePack.rules as Record<
                string,
                unknown
              >,
            }
          : null,
      }
    : null,
  manuscriptType: project.manuscriptType,
  title: project.title,
  status: project.status,
  targetJournal: project.targetJournal,
  metadata: (project.metadata as Project["metadata"]) ?? null,
  readinessScore: project.readinessScore,
  lastReviewedAt: project.lastReviewedAt,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  sections: project.sections?.map(mapSection),
});

export class PrismaProjectRepository implements ProjectRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async createProject(input: CreateProjectInput): Promise<Project> {
    const journal = input.targetJournal
      ? await this.prisma.journal.findFirst({
          where: { id: input.targetJournal },
        })
      : await this.prisma.journal.findFirst({
          where: { isDefault: true },
        });

    if (!journal)
      throw new AppError(
        `Journal not found.`,
        StatusCodes.NOT_FOUND,
        "JOURNAL_NOT_FOUND",
      );

    const project = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const templates = await transaction.journalSectionTemplate.findMany({
          where: {
            journalId: journal.id,
          },
          orderBy: {
            sectionOrder: "asc",
          },
        });

        if (templates.length === 0) {
          throw new AppError(
            `Journal '${journal.name}' has no section templates.`,
            StatusCodes.NOT_FOUND,
            "JOURNAL_HAS_NO_SECTIONS",
          );
        }

        const createdProject = await transaction.project.create({
          data: {
            ownerId: input.ownerId,
            title: input.title,
            targetJournal: journal.name,
            journalId: journal.id,
            metadata: input.metadata as Prisma.InputJsonValue | undefined,
          },
        });

        await transaction.projectSection.createMany({
          data: templates.map((section) => ({
            projectId: createdProject.id,
            key: section.key,
            title: section.title,
            sectionOrder: section.sectionOrder,
            isOptional: section.isOptional,
            maxChars: section.maxChars,
          })),
        });

        return transaction.project.findUniqueOrThrow({
          where: {
            id: createdProject.id,
          },
          include: {
            journal: {
              select: {
                guidelinePack: {
                  select: { id: true, rules: true },
                },
              },
            },
            sections: {
              orderBy: {
                sectionOrder: "asc",
              },
            },
          },
        });
      },
    );

    return mapProject(project);
  }

  public async listProjectsByOwner(ownerId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        ownerId,
        deletedAt: null,
      },
      include: {
        journal: {
          select: {
            guidelinePack: {
              select: { id: true, rules: true },
            },
          },
        },
        sections: {
          orderBy: {
            sectionOrder: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return projects.map(mapProject);
  }

  public async findProjectByIdForOwner(
    projectId: string,
    ownerId: string,
  ): Promise<Project | null> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId,
        deletedAt: null,
      },
      include: {
        journal: {
          select: {
            guidelinePack: {
              select: { id: true, rules: true },
            },
          },
        },
        sections: {
          orderBy: {
            sectionOrder: "asc",
          },
        },
      },
    });

    return project ? mapProject(project) : null;
  }

  public async updateProject(input: UpdateProjectInput): Promise<Project> {
    const project = await this.prisma.project.update({
      where: {
        id: input.projectId,
      },
      data: {
        title: input.title,
        targetJournal: input.targetJournal,
        status: input.status,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
      include: {
        journal: {
          select: {
            guidelinePack: {
              select: { id: true, rules: true },
            },
          },
        },
        sections: {
          orderBy: {
            sectionOrder: "asc",
          },
        },
      },
    });

    return mapProject(project);
  }

  public async archiveProject(
    projectId: string,
    ownerId: string,
  ): Promise<void> {
    await this.prisma.project.updateMany({
      where: {
        id: projectId,
        ownerId,
        deletedAt: null,
      },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date(),
      },
    });
  }

  public async updateSectionContent(input: UpdateSectionInput): Promise<{
    section: ProjectSection;
    version: SectionVersion;
  }> {
    const result = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const section = await transaction.projectSection.findFirst({
          where: {
            key: input.sectionKey,
            projectId: input.projectId,
            project: {
              ownerId: input.ownerId,
              deletedAt: null,
            },
          },
        });

        if (!section) {
          return null;
        }

        const contentCharacters = input.content.trim().length;

        if (section.maxChars < contentCharacters)
          throw new AppError(
            `Content exceeds maximum limit of ${section.maxChars} characters.`,
            StatusCodes.BAD_REQUEST,
            `CONTENT_EXCEEDS_LIMIT_CHARACTERS`,
          );

        const latestVersion = await transaction.sectionVersion.findFirst({
          where: {
            sectionId: section.id,
          },
          orderBy: {
            versionNumber: "desc",
          },
        });

        const version = await transaction.sectionVersion.create({
          data: {
            sectionId: section.id,
            versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
            content: input.content,
            changeSummary: input.changeSummary,
            editedById: input.ownerId,
          },
        });

        const updatedSection = await transaction.projectSection.update({
          where: {
            id: section.id,
          },
          data: {
            content: input.content,
            status: input.content.trim().length > 0 ? "DRAFT" : "NOT_STARTED",
            lastEditedAt: new Date(),
          },
        });

        await transaction.project.update({
          where: {
            id: input.projectId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return {
          section: mapSection(updatedSection),
          version: {
            id: version.id,
            sectionId: version.sectionId,
            versionNumber: version.versionNumber,
            content: version.content,
            changeSummary: version.changeSummary,
            editedById: version.editedById,
            createdAt: version.createdAt,
          },
        };
      },
    );

    if (!result) {
      throw new AppError(
        "Section update failed because the section does not exist.",
        StatusCodes.NOT_FOUND,
        "SECTION_NOT_FOUND",
      );
    }

    return result;
  }

  public async findSectionByKey(
    projectId: string,
    ownerId: string,
    sectionKey: ProjectSection["key"],
  ): Promise<ProjectSection | null> {
    const section = await this.prisma.projectSection.findFirst({
      where: {
        projectId,
        key: sectionKey,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
      include: {
        project: {
          select: {
            journalId: true,
          },
        },
      },
    });

    if (!section) return null;
    if (!section.project.journalId) return mapSection(section);

    const sectionTemplate = await this.prisma.journalSectionTemplate.findFirst({
      where: {
        journalId: section.project.journalId,
        key: sectionKey,
      },
      include: {
        checklists: {},
      },
    });

    const checklists = sectionTemplate?.checklists ?? [];

    const checklistIds = checklists.map((item) => item.id);

    const checklistItems = await this.prisma.sectionChecklistItemCheck.findMany(
      {
        where: {
          sectionId: section.id,
          checklistId: { in: checklistIds },
        },
        select: { checklistId: true, itemIndex: true, checked: true },
      },
    );

    return {
      ...mapSection(section),
      checklist: sectionTemplate?.checklists.map((item) => ({
        id: item.id,
        title: item.title,
        items: item.items.map((text, index) => ({
          text,
          checked:
            checklistItems.find(
              (ch) => ch.checklistId === item.id && ch.itemIndex === index,
            )?.checked ?? false,
        })),
      })),
    };
  }

  public async findSectionById(
    sectionId: string,
    ownerId: string,
    projectId: string,
  ): Promise<ProjectSection | null> {
    const section = await this.prisma.projectSection.findFirst({
      where: {
        id: sectionId,
        projectId,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
    });

    return section ? mapSection(section) : null;
  }

  public async toggleSectionChecklistItem(
    projectId: string,
    ownerId: string,
    sectionKey: string,
    checklistId: string,
    itemIndex: number,
  ): Promise<{ checked: boolean }> {
    // 1) Find section
    const section = await this.prisma.projectSection.findFirst({
      where: {
        projectId,
        key: sectionKey,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        project: { select: { journalId: true } },
      },
    });

    if (!section) {
      throw new AppError(
        "Section was not found.",
        StatusCodes.NOT_FOUND,
        "SECTION_NOT_FOUND",
      );
    }

    const journalId = section.project.journalId;
    if (!journalId) {
      throw new AppError(
        "Project has no journal assigned.",
        StatusCodes.BAD_REQUEST,
        "PROJECT_HAS_NO_JOURNAL",
      );
    }

    // 2) Find Checklists of a section
    const checklist = await this.prisma.sectionChecklist.findFirst({
      where: {
        id: checklistId,
        journalSectionTemplate: {
          key: sectionKey,
          journalId,
        },
      },
      select: { id: true, items: true },
    });

    if (!checklist) {
      throw new AppError(
        "Section checklist not found",
        StatusCodes.NOT_FOUND,
        "CHECKLIST_NOT_FOUND",
      );
    }

    // validate item index
    if (itemIndex < 0 || itemIndex >= checklist.items.length) {
      throw new AppError(
        "Checklist item index out of range",
        StatusCodes.BAD_REQUEST,
        "CHECKLIST_ITEM_INDEX_INVALID",
      );
    }

    // Check if a checklistItem is in DB , if was update it , if was not create it
    const existing = await this.prisma.sectionChecklistItemCheck.findFirst({
      where: {
        sectionId: section.id,
        checklistId: checklist.id,
        itemIndex,
      },
      select: { id: true, checked: true },
    });

    const result = existing
      ? await this.prisma.sectionChecklistItemCheck.update({
          where: { id: existing.id },
          data: { checked: !existing.checked },
          select: { checked: true },
        })
      : await this.prisma.sectionChecklistItemCheck.create({
          data: {
            sectionId: section.id,
            checklistId: checklist.id,
            itemIndex,
            checked: true,
          },
          select: { checked: true },
        });

    return { checked: result.checked };
  }
}
