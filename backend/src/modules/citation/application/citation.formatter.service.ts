import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";
import { APACitationFormatter } from "../infrastructure/formatters/apa.formatter";
import { Citation } from "../domain/citation";
import { ChicagoAuthorDateCitationFormatter } from "../infrastructure/formatters/chicago.author.date.formatter";
import { MLACitationFormatter } from "../infrastructure/formatters/mla.formatter";
import { HarvardCitationFormatter } from "../infrastructure/formatters/harvard.formatter";

export class CitationFormatterService {
  constructor(
    private readonly apa: APACitationFormatter,
    private readonly chicagoAuthorDate: ChicagoAuthorDateCitationFormatter,
    private readonly harvard: HarvardCitationFormatter,
    private readonly mla: MLACitationFormatter,
  ) {}

  public async generateCitation(input: Citation): Promise<string> {
    switch (input.style) {
      case "APA":
        return this.apa.formatCitation(input.reference);
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
