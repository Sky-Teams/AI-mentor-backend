export class IEEECitationFormatter {
  public formatCitation(citationNumber: number) {
    return {
      formattedText: `[${citationNumber}]`,
    };
  }
}
