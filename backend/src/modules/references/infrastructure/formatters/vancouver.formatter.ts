import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { getYear } from "src/shared/utils/format-citation-helper";

export class VancouverFormatter {
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
    const authors = c.authors ? `${await this.formatAuthors(c?.authors)}` : "";
    const year = c.datePublished ? ` ${await getYear(c?.datePublished)};` : "";
    const journalNameAbbrev = c?.journalNameAbbrev
      ? ` ${c.journalNameAbbrev.replace(/\./g, "")}`
      : ` ${c.journalName}`;
    const title = c?.title ? ` ${c.title}.` : "";
    const formatPages = this.formatPages(c?.page);

    let citationDetails = year;
    if (c?.volume || c?.page || c?.issue) {
      if (c?.volume) citationDetails += ` ${c.volume}${c.issue ? "" : ":"}`;
      if (c?.issue) citationDetails += `(${c.issue}):`;
      if (c?.page) {
        if (c?.volume || c?.issue) {
          citationDetails += ` ${formatPages}.`;
        } else {
          citationDetails += ` ${formatPages}.`;
        }
      }
    }

    const doiPart = c?.doi ? ` ${c.doi}` : "";

    return `${authors}${title}${journalNameAbbrev}${citationDetails}${doiPart}`;
  }

  private async formatAuthors(authors: any) {
    if (!authors) return "";

    const changeToArray = Array.isArray(authors) ? authors : [authors];
    const authorsArray = Object.values(changeToArray);
    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        .trim()
        .split(" ")
        .map((n: string) => n.charAt(0).toUpperCase() + "")
        .join("");

      const lastNameClean = author.lastName.replace(/\s+/g, "").trim();
      return `${lastNameClean} ${initials}`;
    });

    if (formatted.length === 1) return `${formatted[0]}.`;

    if (authorsArray.length > 6) {
      const firstSix = formatted.slice(0, 6);
      return `${firstSix.join(", ")}, et al.`;
    }

    const lastAuthor = formatted.pop();
    return `${formatted.join(", ")}, ${lastAuthor}.`;
  }

  private formatPages(pages: any) {
    if (!pages || pages.trim() === "") return "";
    const cleanPages = pages.replace(/\s+/g, "");
    const parts = cleanPages.split("-");
    if (parts.length === 1) return parts[0];

    if (parts.length > 2) return cleanPages;

    if (parts.length === 2) {
      const start = parts[0];
      const end = parts[1];

      if (start.length !== end.length) return cleanPages;

      if (start.length === end.length && start === end) return start;

      let sharedIndex = 0;
      while (
        sharedIndex < start.length &&
        start[sharedIndex] === end[sharedIndex]
      ) {
        sharedIndex++;
      }

      if (sharedIndex > 0 && start[sharedIndex - 1] === "0") {
        sharedIndex -= 1;
      }
      let abbreviatedEnd = end.substring(sharedIndex);

      return `${start}-${abbreviatedEnd}`;
    }

    return "";
  }
}
