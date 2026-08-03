import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";
import { APACitationFormatter } from "../infrastructure/formatters/apa.formatter";
import { Citation } from "../domain/citation";
import { IEEECitationFormatter } from "../infrastructure/formatters/IEEE.formatter";
import { AMACitationFormatter } from "../infrastructure/formatters/ama.formatter";
import { ChicagoFullNoteCitationFormatter } from "../infrastructure/formatters/chicago.full.note.formatter";
import { ChicagoAuthorDateCitationFormatter } from "../infrastructure/formatters/chicago.author.date.formatter";
import { MLACitationFormatter } from "../infrastructure/formatters/mla.formatter";
import { HarvardCitationFormatter } from "../infrastructure/formatters/harvard.formatter";

export class CitationFormatterService {
  constructor(
    private readonly apa: APACitationFormatter,
    private readonly ieeeCitationFormat: IEEECitationFormatter,
    private readonly amaCitationFormat: AMACitationFormatter,
    private chicagoFullNoteCitationFormat: ChicagoFullNoteCitationFormatter,
    private readonly chicagoAuthorDate: ChicagoAuthorDateCitationFormatter,
    private readonly harvard: HarvardCitationFormatter,
    private readonly mla: MLACitationFormatter,
  ) {}

  public async generateCitation(
    input: Citation,
    sectionId: string,
  ): Promise<string> {
    switch (input.style) {
      case "APA":
        return this.apa.formatCitation(input.reference);
      case "IEEE":
      case "VANCOUVER":
        if (!input.citationNumber)
          throw new AppError(
            "Citation number is required",
            StatusCodes.BAD_REQUEST,
            `CITATION_NUMBER_REQUIRED`,
          );
        return this.ieeeCitationFormat.formatCitation(input.citationNumber);
      case "AMERICAN_CHEMICAL_SOCIETY":
      case "AMA":
        if (!input.citationNumber)
          throw new AppError(
            "Citation number is required",
            StatusCodes.BAD_REQUEST,
            `CITATION_NUMBER_REQUIRED`,
          );
        return this.amaCitationFormat.formatCitation(input.citationNumber);
      case "CHICAGO_FULL_NOTE":
        return this.chicagoFullNoteCitationFormat.formatCitation(
          input.reference,
          sectionId,
        );
      case "CHICAGO_AUTHOR_DATE":
        return this.chicagoAuthorDate.formatCitation(input.reference);
      case "MLA":
        return this.mla.formatCitation(input.reference);
      case "HARVARD":
        return this.harvard.formatCitation(input.reference);
      default:
        throw new AppError(
          "Unsupported citation type",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_CITATION_TYPE",
        );
    }
  }
}
