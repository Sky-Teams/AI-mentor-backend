import { Reference } from "src/modules/references/domain/reference";

export class IEEECitationFormatter {
  public formatCitation(reference: Reference, citationNumber: number) {
    return {
      referenceId: reference.id,
      formattedText: `[${citationNumber}]`,
    };
  }
}
