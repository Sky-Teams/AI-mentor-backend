import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";
import { APACitationFormatter } from "../infrastructure/formatters/apa.formatter";
import { Citation } from "../domain/citation";

export class CitationFormatterService {
  constructor(private readonly apa: APACitationFormatter) {}

  public async generateCitation(input: Citation): Promise<string> {
    switch (input.style) {
      case "APA":
        return this.apa.formatCitation(input.reference);
      default:
        throw new AppError(
          "Unsupported citation type",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_CITATION_TYPE",
        );
    }
  }
}
