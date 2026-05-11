import { AppError } from "src/shared/errors/app-error";
import { Citation, CitationFormatType, CitationType } from "../domain/citation";
import { APAFormatter } from "../infrastructure/APAFormatter";
import { MLAFormatter } from "../infrastructure/MLAFormatter";

export class CitationFormatterService {
  constructor(
    private apa: APAFormatter,
    private mla: MLAFormatter,
  ) {}
  format(citation: Citation, type: CitationType, style: CitationFormatType) {
    switch (style) {
      case "APA":
        return this.apa.format(citation, type);
      case "MLA":
        return this.mla.format(citation, type);
      default:
        throw new AppError(
          "Unsupported format type",
          404,
          "UNSUPPORTED_FORMAT_TYPE",
        );
    }
  }
}
