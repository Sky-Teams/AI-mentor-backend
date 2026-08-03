import { Reference } from "src/modules/references/domain/reference";
import { formatPage } from "src/shared/utils/format-citation-helper";

export class MLACitationFormatter {
  public formatCitation(reference: Reference) {
    return this.parentheticalCitationFormat(reference);
  }

  private parentheticalCitationFormat(reference: Reference): string {
    const authors =
      reference?.authors && reference.authors?.length !== 0
        ? this.formatAuthor(reference.authors)
        : reference.title
          ? `"${reference.title}"`
          : "";

    const page = reference.page ? formatPage(reference.page) : "";

    let publicationPart = "";

    if (authors) publicationPart += authors;

    if (page && publicationPart) publicationPart += ` ${page}`;

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

    return `${formatted[0]} et al.`;
  }
}
