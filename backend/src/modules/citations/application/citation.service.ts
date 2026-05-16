import { UserRepository } from "src/modules/users/domain/user";
import {
  Citation,
  CitationFormatTypes,
} from "../domain/citation";
import { CitationRepository } from "../domain/citation.repository";
import { CitationFormatterService } from "./formatter.service";
import { ProjectService } from "src/modules/projects/application/project.service";

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
    formateStyle: CitationFormatTypes;
  }) {
    await this.userRepositiry.getUserById(input.ownerId);
    await this.projectService.getProject(input.projectId, input.ownerId);
    await this.citationRepository.createCitaiotn({
      citation: input.citation,
      ownerId: input.ownerId,
      projectId: input.projectId,
    });
    return this.formatterService.format(input.citation, input.formateStyle);
  }
}
