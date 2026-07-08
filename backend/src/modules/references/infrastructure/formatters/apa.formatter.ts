import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { formatPage, getYear } from "src/shared/utils/format-citation-helper";

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
    const authors = c.authors ? await this.formatAuthors(c.authors) : "";
    const year = c.datePublished ? ` (${await getYear(c.datePublished)}).` : "";

    let titlePart = "";
    if (c.title) {
      if (c.title.includes(":")) {
        const formatTitle = c.title
          .split(":")
          .map((text: string) => {
            text = text.trim();
            return text.charAt(0).toUpperCase() + text.slice(1);
          })
          .join(": ");

        titlePart = ` ${formatTitle}.`;
      } else {
        titlePart = ` ${c.title.trim()}.`;
      }
    }

    let publicationPart = "";

    if (c.journalName) {
      publicationPart = ` <i>${c.journalName.trim()}</i>`;

      if (c.volume) {
        publicationPart += `, <i>${c.volume}</i>`;

        if (c.issue) {
          publicationPart += `(${c.issue})`;
        }
      } else if (c.issue) {
        publicationPart += `, (${c.issue})`;
      }

      if (c.page) {
        publicationPart += `, ${await formatPage(c.page)}`;
      }

      publicationPart += ".";
    }

    const doiPart = c?.doi
      ? ` https://doi.org/${c.doi.trim().replace(/^https?:\/\/doi\.org\//, "")}`
      : "";

    return `${authors}${year}${titlePart}${publicationPart}${doiPart}`;
  }

  public async formatAuthors(authors: any) {
    if (!authors) return "";
    const authorsArray = authors ? Object.values(authors) : [];

    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        .trim()
        .split(" ")
        .map((n: string) => n.charAt(0).toUpperCase() + ".")
        .join(" ");

      return `${author.lastName.trim()}, ${initials}`;
    });

    if (formatted.length === 1) {
      return formatted[0];
    }

    const lastAuthor = formatted.pop();

    if (formatted.length >= 20) {
      const finalFormat = formatted.slice(0, 19).join(", ");
      return `${finalFormat}, ...${lastAuthor}`;
    }

    return `${formatted.join(", ")}, & ${lastAuthor}`;
  }
}
