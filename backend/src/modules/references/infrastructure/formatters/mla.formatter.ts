import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { getYear } from "src/shared/utils/format-citation-helper";

export class MLAFormatter {
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
    let authors = await this.formatAuthors(c?.authors);

    const page = c?.page ? ` ${await this.formatMLAPages(c.page)}.` : "";
    const volume = c?.volume ? ` vol. ${c.volume},` : "";
    const issue = c?.issue
      ? ` no. ${c.issue}${c.datePublished ? "," : "."}`
      : "";
    const year = c.datePublished
      ? ` ${await getYear(c?.datePublished)}${c.page ? "," : "."}`
      : "";
    const doiPart = c?.doi ? ` ${c.doi}.` : "";
    const title = c?.title ? ` "${c.title}." ` : "";
    const journalName = c?.journalName ? ` <i>${c.journalName},</i>` : "";

    return `${authors}${title}${journalName}${volume}${issue}${year}${page}${doiPart}`;
  }

  private async formatAuthors(authors: any): Promise<string> {
    if (!authors) return "";

    const authorsArray = Array.isArray(authors) ? authors : [authors];
    const count = authorsArray.length;

    if (count === 0) return "";

    const initials = authorsArray.slice(0, 3).map((author) => {
      const firstName =
        author.firstName
          .trim()
          ?.split(" ")
          ?.map((n: string) => n.charAt(0).toUpperCase() + n.slice(1))
          ?.join(" ") || "";

      return firstName;
    });
    if (count === 1) {
      return `${authorsArray[0].lastName}, ${initials[0]}.`;
    }

    if (count === 2) {
      return `${authorsArray[0].lastName}, ${initials[0]}, and ${initials[1]} ${authorsArray[1].lastName}.`;
    }

    return `${authorsArray[0].lastName}, ${initials[0]}, et al.`;
  }

  private async formatMLAPages(pages: any) {
    if (!pages) return "";
    if (!pages.includes("-")) return `p. ${pages}`;

    const formatPages = pages.trim().split("-");

    if (
      formatPages.length === 2 &&
      formatPages[0].length !== formatPages[1].length
    )
      return `pp. ${pages}`;

    if (formatPages.length === 2 && formatPages[0] === formatPages[1]) {
      return `p. ${formatPages[0]}`;
    }

    if (formatPages.length > 2) return `p. ${formatPages[0]}+`;

    let sharedIndex = 0;
    while (
      sharedIndex < formatPages[0].length &&
      formatPages[0][sharedIndex] === formatPages[1][sharedIndex]
    ) {
      sharedIndex++;
    }

    return `pp. ${formatPages[0]}-${formatPages[1].slice(sharedIndex)}`;
  }
}
