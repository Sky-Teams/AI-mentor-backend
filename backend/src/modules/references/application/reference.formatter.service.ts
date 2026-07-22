import { AppError } from "src/shared/errors/app-error";
import { Reference, ReferenceStyle, ReferenceTypes } from "../domain/reference";
import { APAFormatter } from "../infrastructure/formatters/apa.formatter";
import { MLAFormatter } from "../infrastructure/formatters/mla.formatter";
import { VancouverFormatter } from "../infrastructure/formatters/vancouver.formatter";
import { StatusCodes } from "http-status-codes";
import { AMAFormatter } from "../infrastructure/formatters/ama.formatter";
import { AmericaChemicalSocietyFormatter } from "../infrastructure/formatters/american.chemical.society.formatter";

export class ReferenceFormatterService {
  constructor(
    private readonly apa: APAFormatter,
    private mla: MLAFormatter,
    private vancouver: VancouverFormatter,
    private ama: AMAFormatter,
    private americanChemicalSociety: AmericaChemicalSocietyFormatter,
  ) {}

  format(reference: Reference, type: ReferenceTypes, style: ReferenceStyle) {
    switch (style) {
      case "APA":
        return this.apa.format(reference, type);
      case "MLA":
        return this.mla.format(reference, type);
      case "VANCOUVER":
        return this.vancouver.format(reference, type);
      case "AMA":
        return this.ama.format(reference, type);
      case "AMERICAN_CHEMICAL_SOCIETY":
        return this.americanChemicalSociety.format(reference, type);
      default:
        throw new AppError(
          "Unsupported format style",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_FORMAT_STYLE",
        );
    }
  }
}
