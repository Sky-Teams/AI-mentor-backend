import { PrismaClient, type Prisma } from "@prisma/client";
import { CASE_REPORT_SECTION_DEFINITIONS } from "../../../shared/constants/sections";
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

const mapSection = (section: {
  id: string;
  projectId: string;
  key: ProjectSection["key"];
  title: string;
  content: string;
  sectionOrder: number;
  isOptional: boolean;
  status: ProjectSection["status"];
  lastEditedAt: Date | null;
  updatedAt: Date;
}): ProjectSection => ({
  id: section.id,
  projectId: section.projectId,
  key: section.key,
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
    status: ProjectSection["status"];
    lastEditedAt: Date | null;
    updatedAt: Date;
  }>;
}): Project => ({
  id: project.id,
  ownerId: project.ownerId,
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
    const project = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const createdProject = await transaction.project.create({
          data: {
            ownerId: input.ownerId,
            title: input.title,
            targetJournal: input.targetJournal,
            metadata: input.metadata as Prisma.InputJsonValue,
          },
        });

        await transaction.projectSection.createMany({
          data: CASE_REPORT_SECTION_DEFINITIONS.map((section) => ({
            projectId: createdProject.id,
            key: section.key,
            title: section.title,
            sectionOrder: section.order,
            isOptional: section.optional,
          })),
        });

        return transaction.project.findUniqueOrThrow({
          where: {
            id: createdProject.id,
          },
          include: {
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
        metadata: input.metadata as Prisma.InputJsonValue,
      },
      include: {
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
      throw new Error(
        "Section update failed because the section does not exist.",
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
    });

    return section ? mapSection(section) : null;
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
}
