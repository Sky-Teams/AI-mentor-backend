import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { getYear } from "src/shared/utils/format-citation-helper";

export class HarvardFormatter {
  public async format(
    reference: Reference,
    type: ReferenceTypes,
  ): Promise<string> {
    switch (type) {
      case "JOURNAL":
        return this.formatJournal(reference);
      default:
        throw new AppError(
          "Unsupported reference type",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_REFERENCE_TYPE",
        );
    }
  }

  private async formatJournal(c: JournalSearchResponse) {
    let authors = c.authors ? await this.formatAuthors(c.authors) : "";
    const page = c.page ? await this.formatPage(c.page) : "";

    let publicationPart = "";

    if (c.title && !authors) {
      authors = `${c.title}`;
    }

    if (c.datePublished) {
      publicationPart += `(${await getYear(c.datePublished)})`;
    }

    if (c.title && authors !== c.title) {
      publicationPart += ` '${c.title}'`;
      if (c.journalName || c.volume || c.issue || c.page)
        publicationPart += ",";
    }

    if (c.journalName) {
      publicationPart += ` <i>${c.journalName}</i>`;
      if (c.volume || c.issue || c.page) publicationPart += ",";
    }

    if (c.volume) {
      publicationPart += ` ${c.volume}`;
      if (c.issue) publicationPart += `(${c.issue})`;

      if (c.page) publicationPart += ",";
    } else {
      if (c.issue) {
        publicationPart += `(${c.issue})`;
        if (c.page) publicationPart += ",";
      }
    }

    if (c.page) publicationPart += ` ${page}`;
    if (publicationPart) publicationPart += ".";

    const doi = c.doi
      ? ` doi: ${c.doi.replace(/^https?:\/\/doi\.org\//, "")}`
      : "";
    return `${authors}${publicationPart}${doi}`;
  }

  private async formatAuthors(authors: any) {
    if (!authors) return "";

    const authorArray = authors ? Object.values(authors) : [];
    if (authorArray.length === 0) return "";

    const formatted = authorArray.map((author: any) => {
      const initials = author.firstName
        ?.split(" ")
        .map((n: string) => n.charAt(0).toUpperCase() + "")
        .join("");

      return `${author.lastName}, ${initials}.`;
    });

    if (formatted.length === 1) return formatted[0];

    let lastAuthor = formatted.pop();

    return `${formatted.join(", ")} and ${lastAuthor}`;
  }

  private async formatPage(pages: string) {
    if (!pages) return "";

    if (!pages.includes("-")) return `p. ${pages}`;

    const listOfPages = pages.split("-");
    if (listOfPages.length === 2 && listOfPages[0] === listOfPages[1])
      return `p. ${listOfPages[0]}`;

    return `pp. ${pages}`;
  }
}
