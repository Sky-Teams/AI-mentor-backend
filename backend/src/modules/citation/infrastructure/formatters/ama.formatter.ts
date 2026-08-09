import { Reference } from "src/modules/references/domain/reference";

export class AMACitationFormatter {
  public formatCitation(reference: Reference, referenceIndex: number) {
    const result = this.toSuperscript(referenceIndex);
    return {
      referenceId: reference.id,
      formattedText: result,
    };
  }

  superscriptMap: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
  };
  toSuperscript(value: number): string {
    return value
      .toString()
      .split("")
      .map((digit) => this.superscriptMap[digit] ?? digit)
      .join("");
  }
}
