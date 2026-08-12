import { Reference } from "src/modules/references/domain/reference";
import { formatPage, getYear } from "src/shared/utils/format-citation-helper";

export class ChicagoFullNoteCitationFormatter {
  public formatCitation(reference: Reference) {
    let footNotes = "";
    if (reference.authors && reference.authors.length !== 0)
      footNotes += `${this.formatAuthors(reference.authors)},`;
    if (reference.title) footNotes += ` "${reference.title},"`;
    if (reference.journalName) footNotes += ` ${reference.journalName}`;

    if (reference.volume) footNotes += ` ${reference.volume}`;
    if (reference.issue) footNotes += `, no. ${reference.issue}`;

    if (reference.datePublished)
      footNotes += ` (${getYear(reference.datePublished)})`;

    if (reference.page) footNotes += `: ${formatPage(reference.page)}`;

    if (footNotes) footNotes += ".";

    return {
      referenceId: reference.id,
      footnote: footNotes,
    };
  }

  private formatAuthors(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];
    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      return `${author.firstName} ${author.lastName}`;
    });

    if (formatted.length === 1) return formatted[0];

    const lastAuthor = formatted.pop();

    return `${formatted.join(", ")}, and ${lastAuthor}`;
  }
}
