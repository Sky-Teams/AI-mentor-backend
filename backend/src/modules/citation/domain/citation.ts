import { Reference, ReferenceStyle } from "src/modules/references/domain/reference";
export const citationType = ["PARENTHETICAL"] as const;

export type CitationType = (typeof citationType)[number];

export interface Citation {
  type: CitationType;
  style: ReferenceStyle
  reference: Reference;
}
