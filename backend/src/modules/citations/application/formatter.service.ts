import { AppError } from "src/shared/errors/app-error";
import { Citation, CitationFormatter } from "../domain/citation";
import { APAFormatter } from "../infrastructure/APAFormatter";
import { MLAFormatter } from "../infrastructure/MLAFormatter";

export class CitationFormatterService {
  constructor(
    private apa: APAFormatter,
    private mla: MLAFormatter,
  ) {}
  format(citation: Citation, style: CitationFormatter) {
    switch (style) {
      case "APA":
        return this.apa.format(citation);
      case "MLA":
        return this.mla.format(citation);
      default:
        throw new AppError(
          `Unsupported format type`,
          404,
          "UNSUPPORTED_FORMAT_TYPE",
        );
    }
  }
}
