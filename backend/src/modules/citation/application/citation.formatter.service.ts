import {
  Reference,
  ReferenceStyle,
} from "src/modules/references/domain/reference";
import { CitationType } from "../domain/citation";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";
import { APACitationFormatter } from "../infrastructure/formatters/apa.formatter";

export class CitationFormatterService {
  constructor(private readonly apa: APACitationFormatter) {}

  public async generateCitation(
    type: CitationType,
    style: ReferenceStyle,
    reference: Reference,
  ): Promise<string> {
    switch (style) {
      case "APA":
        return this.apa.formatCitation(type, reference);
      default:
        throw new AppError(
          "Unsupported citation type",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_CITATION_TYPE",
        );
    }
  }
}
