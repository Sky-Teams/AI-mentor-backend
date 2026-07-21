import { AppError } from "src/shared/errors/app-error";
import { Reference, ReferenceStyle, ReferenceTypes } from "../domain/reference";
import { APAFormatter } from "../infrastructure/formatters/APAFormatter";
import { MLAFormatter } from "../infrastructure/formatters/MLAFormatter";
import { VancouverFormatter } from "../infrastructure/formatters/VancouverFormatter";
import { StatusCodes } from "http-status-codes";
import { HarvardFormatter } from "../infrastructure/formatters/harvard.formatter";
import { IEEEFormatter } from "../infrastructure/formatters/IEEE.formatter";
import { ChicagoAuthorDateFormatter } from "../infrastructure/formatters/chicago.author.date.formatter";
import { ChicagoFullNoteFormatter } from "../infrastructure/formatters/chicago.full.note.formatter";
import { OSCOLAFormatter } from "../infrastructure/formatters/OSCOLA.formatter";

export class ReferenceFormatterService {
  constructor(
    private readonly apa: APAFormatter,
    private mla: MLAFormatter,
    private vancouver: VancouverFormatter,
    private harvard: HarvardFormatter,
    private ieee: IEEEFormatter,
    private chicagoAuthorDate: ChicagoAuthorDateFormatter,
    private chicagoFullNote: ChicagoFullNoteFormatter,
    private oscola: OSCOLAFormatter,
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
      case "IEEE":
        return this.ieee.format(reference, type);
      case "CHICAGO_AUTHOR_DATE":
        return this.chicagoAuthorDate.format(reference, type);
      case "CHICAGO_FULL_NOTE":
        return this.chicagoFullNote.format(reference, type);
      case "OSCOLA":
        return this.oscola.format(reference, type);
      default:
        throw new AppError(
          "Unsupported format style",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_FORMAT_STYLE",
        );
    }
  }
}
