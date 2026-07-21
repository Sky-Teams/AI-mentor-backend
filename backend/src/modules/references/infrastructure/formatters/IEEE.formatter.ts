import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { getYear, monthNames } from "src/shared/utils/format-citation-helper";

export class IEEEFormatter {
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
    const author = c.authors ? await this.formatAuthor(c.authors) : "";
    const title = c.title ? ` "${c.title},"` : "";
    const year = c.datePublished ? `${await getYear(c.datePublished)}` : "";

    const month = c.datePublished
      ? `${monthNames[new Date(c.datePublished).getMonth()]}`
      : "";

    let publicationPart = "";
    if (c.journalName) {
      publicationPart += ` <i>${c.journalName}</i>`;
    }
    if (c.volume)
      publicationPart += `${c.journalName ? "," : ""} vol. ${c.volume}`;

    if (c.issue)
      publicationPart += `${c.journalName || c.volume ? "," : ""} no. ${c.issue}`;

    if (c.page)
      publicationPart += `${c.journalName || c.volume || c.issue ? "," : ""} ${await this.formatPage(c.page)}`;

    if (c.datePublished) {
      publicationPart += `${c.journalName || c.volume || c.issue || c.page ? "," : ""}`;
      if (month) publicationPart += ` ${month}.`;
      if (year) publicationPart += ` ${year}`;
    }

    if (publicationPart && c.doi) publicationPart += ",";

    const doi = c.doi
      ? ` doi: ${c.doi.replace(/^https?:\/\/doi\.org\//, "")}`
      : "";

    return `${author}${title}${publicationPart}${doi}.`;
  }

  private async formatAuthor(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];
    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        ?.split(" ")
        .map((n: string) => n.charAt(0).toUpperCase() + "")
        .join(". ");

      return `${initials}. ${author.lastName}`;
    });

    if (formatted.length === 1) return `${formatted},`;

    let lastAuthor = formatted.pop();

    if (formatted.length >= 6) return `${formatted[0]} <i>et al.,</i>`;

    return `${formatted.join(", ")}, and ${lastAuthor},`;
  }

  private async formatPage(pages: string) {
    if (!pages) return "";

    if (!pages.includes("-")) return `p. ${pages}`;

    const listOfPages = pages.split("-");
    if (listOfPages.length === 2 && listOfPages[0] === listOfPages[1])
      return `p. ${listOfPages[0]}`;

    if (listOfPages.length === 2 && listOfPages[0] !== listOfPages[1])
      return `pp. ${pages}`;

    return `pp. ${pages}`;
  }
}
