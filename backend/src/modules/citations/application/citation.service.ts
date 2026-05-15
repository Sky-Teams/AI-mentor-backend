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
    await this.citationRepository.createCitation({
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

  public async updateCitation(input: {
    id: string;
    ownerId: string;
    projectId: string;
    citation: Citation;
    style?: CitationFormatType;
  }) {
    await this.userRepositiry.getUserById(input.ownerId);
    await this.projectService.getProject(input.projectId, input.ownerId);
    const citation = await this.citationRepository.GetCitationById(
      input.id,
      input.ownerId,
    );
    if (!citation) {
      throw new AppError(
        "Citation was not found",
        StatusCodes.NOT_FOUND,
        "CITATION_NOT_FOUND",
      );
    }

    const result = await this.citationRepository.updateCitation({
      id: input.id,
      citation: input.citation,
      style: input.style,
    });
    
    const currentData =
      result.type === "BOOK"
        ? result.bookCitation
        : result.type === "JOURNAL"
          ? result.journalCitation
          : result.type === "REPORT"
            ? result.reportCitation
            : result.type === "WEBSITE"
              ? result.websiteCitation
              : null;
    return this.formatterService.format(
      currentData as Citation,
      result.type,
      result.style,
    );
  }
}
