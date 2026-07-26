import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { getYear } from "src/shared/utils/format-citation-helper";

export class OSCOLAFormatter {
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
    const authors = c.authors ? await this.formatAuthor(c.authors) : "";
    const journalNameAbbrev = c.journalNameAbbrev
      ? ` ${c.journalNameAbbrev}`
      : c.journalName
        ? ` <i>${c.journalName}</i>`
        : "";

    let publicationPart = "";

    if (c.title) publicationPart += ` ‘${c.title}’`;

    if (c.volume) {
      publicationPart += ` (${await getYear(c.datePublished)}) ${c.volume}`;
    } else {
      publicationPart += ` [${await getYear(c.datePublished)}]`;
    }

    if (journalNameAbbrev) {
      publicationPart += ` ${journalNameAbbrev}`;
    }
    if (c.page) publicationPart += ` ${await this.formatPage(c.page)}`;

    const doiPart = c.doi
      ? ` https://doi.org/${c.doi.replace(/^https?:\/\/doi\.org\//, "")}`
      : "";
    return `${authors}${publicationPart}${doiPart}.`;
  }

  private async formatAuthor(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];

    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        ?.split(" ")
        .map((n: string) => n.charAt(0).toUpperCase() + "")
        .join("");

      return `${initials} ${author.lastName}`;
    });

    if (formatted.length === 1) return `${formatted[0]},`;

    if (formatted.length > 3) return `${formatted[0]} and others,`;

    const lastAuthor = formatted.pop();

    return `${formatted.join(", ")} and ${lastAuthor}`;
  }

  private async formatPage(pages: string) {
    if (!pages) return "";

    if (!pages.includes("-")) {
      return pages;
    }

    const listOfPages = pages.split("-");

    if (listOfPages.length === 2 && listOfPages[0] === listOfPages[1])
      return listOfPages[0];

    return `${pages.replace("-", ", ")}`;
  }
}
