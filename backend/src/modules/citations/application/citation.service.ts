import {
  BaseCitationOutPut,
  Citation,
  CitationFormatter,
} from "../domain/citation";
import { CitationRepository } from "../domain/citation.repository";
import { CitationFormatterService } from "./formatter.service";

export class CitationService {
  constructor(
    private readonly formatterService: CitationFormatterService,
    private readonly citationRepository: CitationRepository,
  ) {}

  public async createCitation(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
    formateStyle: CitationFormatter;
  }) {
    await this.citationRepository.createCitaiotn({
      citation: input.citation,
      ownerId: input.ownerId,
      projectId: input.projectId,
    });
    return this.formatterService.format(input.citation, input.formateStyle);
  }
}
