import { Reference } from "src/modules/references/domain/reference";
import { formatPage, getYear } from "src/shared/utils/format-citation-helper";

export class OSCOLACitationFormatter {
  public formatCitation(reference: Reference) {
    let footnote = "";

    if (reference.authors && reference.authors.length !== 0) {
      footnote += `${this.formatAuthor(reference.authors)}`;
    }

    if (reference.title) footnote += `, '${reference.title}'`;
    if (reference.datePublished)
      footnote += ` (${getYear(reference.datePublished)})`;

    if (reference.volume) {
      footnote += ` ${reference.volume}`;
      if (reference.issue) footnote += `(${reference.issue})`;
    }

    if (reference.journalName) footnote += ` ${reference.journalName}`;

    if (reference.page) footnote += ` ${formatPage(reference.page)}`;

    footnote += ".";
    return {
      referenceId: reference.id,
      footnote: footnote,
    };
  }

  private formatAuthor(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];
    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      return `${author.firstName} ${author.lastName}`;
    });

    if (formatted.length === 1) return formatted[0];

    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;

    return `${formatted[0]} and others`;
  }
}
