import {
  Reference,
  ReferenceStyle,
} from "src/modules/references/domain/reference";

export interface Citation {
  style: ReferenceStyle;
  reference: Reference;
  referenceIndex: number;
}
