import {
  apaFormatter,
  APAFormatter,
} from "../../utils/formatters/APAFormatter";
import {
  mlaFormatter,
  MLAFormatter,
} from "../../utils/formatters/MLAFormatter";
import {
  vancouverFormatter,
  VancouverFormatter,
} from "../../utils/formatters/VancouverFormatter";
import { Reference, ReferenceStyle, ReferenceTypes } from "../api/reference";

export class ReferenceFormatterService {
  constructor(
    private readonly apa: APAFormatter,
    private mla: MLAFormatter,
    private vancouver: VancouverFormatter,
  ) {}
  format(reference: Reference, type: ReferenceTypes, style: ReferenceStyle) {
    switch (style) {
      case "APA":
        return this.apa.format(reference, type);
      case "MLA":
        return this.mla.format(reference, type);
      case "VANCOUVER":
        return this.vancouver.format(reference, type);
      default:
        return "Unsupported format type";
    }
  }
}
export const referenceFormatterService = new ReferenceFormatterService(
  apaFormatter,
  mlaFormatter,
  vancouverFormatter,
);
