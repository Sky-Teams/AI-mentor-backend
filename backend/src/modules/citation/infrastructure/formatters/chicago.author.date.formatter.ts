import { Reference } from "src/modules/references/domain/reference";
import { getYear } from "src/shared/utils/format-citation-helper";

export class ChicagoAuthorDateCitationFormatter {
  public formatCitation(reference: Reference) {
    return this.parentheticalCitationFormat(reference);
  }

  private parentheticalCitationFormat(reference: Reference): string {
    const year = reference?.datePublished
      ? getYear(reference.datePublished)
      : "n.d.";

    const authors =
      reference?.authors && reference.authors?.length !== 0
        ? this.formatAuthor(reference.authors)
        : reference.title
          ? `"${reference.title}"`
          : "";

    const page = reference.page ? reference.page : "";

    let publicationPart = "";

    if (authors) publicationPart += authors;

    if (year && authors) {
      if (authors) publicationPart += ` `;
      publicationPart += year;
    }

    if (page && publicationPart) publicationPart += `, ${page}`;

    return `${publicationPart ? `(${publicationPart})` : ""}`;
  }

  private formatAuthor(authors: any) {
    if (!authors) return null;

    const authorsArray = authors ? Object.values(authors) : [];

    if (authorsArray.length === 0) return null;

    const formatted = authorsArray.map((author: any) => {
      return author.lastName;
    });

    if (formatted.length === 1) return formatted[0];

    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;

    if (formatted.length === 3)
      return `${formatted[0]}, ${formatted[1]}, and ${formatted[2]}`;

    return `${formatted[0]} et al.`;
  }
}
