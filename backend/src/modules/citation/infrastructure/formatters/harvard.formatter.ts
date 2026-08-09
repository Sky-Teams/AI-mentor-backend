import { Reference } from "src/modules/references/domain/reference";
import { formatPage, getYear } from "src/shared/utils/format-citation-helper";

export class HarvardCitationFormatter {
  public formatCitation(reference: Reference) {
    const result = this.parentheticalCitationFormat(reference);
    return {
      referenceId: reference.id,
      formattedText: result,
    };
  }

  private parentheticalCitationFormat(reference: Reference): string {
    const authors =
      reference?.authors && reference.authors?.length !== 0
        ? this.formatAuthor(reference.authors)
        : reference.title
          ? `"${reference.title}"`
          : "";

    const year = reference.datePublished
      ? getYear(reference.datePublished)
      : "n.d.";

    let page = reference.page ? formatPage(reference.page) : "";
    if (reference.page) {
      if (page?.includes("–")) {
        page = `pp. ${page}`;
      } else {
        page = `p. ${page}`;
      }
    }

    let publicationPart = "";

    if (authors) publicationPart += authors;
    if (year && authors) publicationPart += ` ${year}`;

    if (page && authors) publicationPart += `, ${page}`;

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
