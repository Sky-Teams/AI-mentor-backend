import { Reference } from "src/modules/references/domain/reference";
import { getYear } from "src/shared/utils/format-citation-helper";

export class APACitationFormatter {
  public async formatCitation(reference: Reference) {
    const result = await this.parentheticalCitationFormat(reference);
    return {
      formattedText: result,
    };
  }

  private async parentheticalCitationFormat(
    reference: Reference,
  ): Promise<string> {
    const year = reference?.datePublished
      ? await getYear(reference.datePublished)
      : "n.d.";

    const authors =
      reference?.authors && reference.authors?.length !== 0
        ? `${await this.formatAuthor(reference.authors)}${year ? "," : ""}`
        : reference.title
          ? `"${reference.title},"`
          : "";

    let publicationPart = year && authors ? `(${authors} ${year})` : "";
    return publicationPart;
  }

  private async formatAuthor(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];

    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      return author.lastName;
    });

    if (formatted.length === 1) return formatted[0];

    if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;

    return `${formatted[0]} et al.`;
  }
}
