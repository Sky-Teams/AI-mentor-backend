import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { getYear } from "src/shared/utils/format-citation-helper";

export class APAFormatter {
  public async format(
    reference: Reference,
    type: ReferenceTypes,
  ): Promise<string> {
    switch (type) {
      case "JOURNAL":
        return this.formatJournal(reference as JournalSearchResponse);
      default:
        throw new AppError(
          "Unsupported reference type",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_REFERENCE_TYPE",
        );
    }
  }

  private async formatJournal(c: JournalSearchResponse) {
    const authors = await this.formatAuthors(c?.authors);
    const year = await getYear(c?.datePublished);
    const authorPart =
      c?.authors && c.authors.length !== 0 ? `${authors} ` : "";
    const yearPart = c?.datePublished ? `(${year}). ` : "";
    const titlePart = c?.title ? `${c.title.trim()}. ` : "";
    let publicationPart = "";
    if (c?.journalName) {
      publicationPart = c.journalName.trim();
      if (c?.volume) publicationPart += `, ${c.volume}`;
      if (c?.issue) publicationPart += `(${c.issue})`;
      if (c?.page) publicationPart += `, ${c.page.trim()}`;
      publicationPart += ".";
    } else if (c?.page) {
      publicationPart = `${c.page.trim()}.`;
    }

    const doiPart = c?.doi ? ` ${c.doi.trim()}` : "";

    return `${authorPart}${yearPart}${titlePart}${publicationPart}${doiPart}`.trim();
  }

  public async formatAuthors(authors: any) {
    if (!authors) return "";
    const authorsArray = authors ? Object.values(authors) : [];

    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        .split(" ")
        .map((n: string) => n.charAt(0).toUpperCase() + ".")
        .join(" ");

      return `${author.lastName}, ${initials}`;
    });

    if (formatted.length === 1) {
      return formatted[0];
    }

    const lastAuthor = formatted.pop();
    return `${formatted.join(", ")}, & ${lastAuthor}`;
  }
}
