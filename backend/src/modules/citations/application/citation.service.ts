import { UserRepository } from "src/modules/users/domain/user";
import { Citation, CitationFormatType } from "../domain/citation";
import { CitationRepository } from "../domain/citation.repository";
import { CitationFormatterService } from "./formatter.service";
import { ProjectService } from "src/modules/projects/application/project.service";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";

export class CitationService {
  constructor(
    private readonly formatterService: CitationFormatterService,
    private readonly citationRepository: CitationRepository,
    private readonly userRepositiry: UserRepository,
    private readonly projectService: ProjectService,
  ) {}

  public async createCitation(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
    formateStyle: CitationFormatType;
  }) {
    await this.userRepositiry.getUserById(input.ownerId);
    await this.projectService.getProject(input.projectId, input.ownerId);
    await this.citationRepository.createCitaiotn({
      citation: input.citation,
      ownerId: input.ownerId,
      projectId: input.projectId,
      style: input.formateStyle,
    });
    return this.formatterService.format(
      input.citation,
      input.citation.type,
      input.formateStyle,
    );
  }

  public async GetCitation(projectId: string, ownerId: string) {
    await this.userRepositiry.getUserById(ownerId);
    await this.projectService.getProject(projectId, ownerId);
    const result = await this.citationRepository.GetCitation(
      projectId,
      ownerId,
    );
    const citation = await Promise.all(
      result.map((item) => this.citationRepository.GetCitationType(item)),
    );
    return await Promise.all(
      citation.map(async (item) => ({
        id: item.citation.citationId,
        formatted: await this.formatterService.format(
          item.citation,
          item.type,
          item.style,
        ),
      })),
    );
  }

  public async DeleteCitation(citationId: string, ownerId: string) {
    await this.userRepositiry.getUserById(ownerId);
    const citation = await this.citationRepository.GetCitationById(
      citationId,
      ownerId,
    );

    if (!citation) {
      throw new AppError(
        "Citation was not found",
        StatusCodes.NOT_FOUND,
        "CITATION_NOT_FOUND",
      );
    }
    return await this.citationRepository.DeleteCitation(citationId, ownerId);
  }
}
