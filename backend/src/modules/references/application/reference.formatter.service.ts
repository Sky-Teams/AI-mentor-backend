import { AppError } from "src/shared/errors/app-error";
import { Reference, ReferenceStyle, ReferenceTypes } from "../domain/reference";
import { APAFormatter } from "../infrastructure/formatters/APAFormatter";
import { MLAFormatter } from "../infrastructure/formatters/MLAFormatter";
import { VancouverFormatter } from "../infrastructure/formatters/VancouverFormatter";
import { StatusCodes } from "http-status-codes";
import { HarvardFormatter } from "../infrastructure/formatters/harvard.formatter";

export class ReferenceFormatterService {
  constructor(
    private readonly apa: APAFormatter,
    private mla: MLAFormatter,
    private vancouver: VancouverFormatter,
    private harvard: HarvardFormatter,
  ) {}

  format(reference: Reference, type: ReferenceTypes, style: ReferenceStyle) {
    switch (style) {
      case "APA":
        return this.apa.format(reference, type);
      case "MLA":
        return this.mla.format(reference, type);
      case "VANCOUVER":
        return this.vancouver.format(reference, type);
      case "HARVARD":
        return this.harvard.format(reference, type);
      default:
        throw new AppError(
          "Unsupported format style",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_FORMAT_STYLE",
        );
    }
  }
}
