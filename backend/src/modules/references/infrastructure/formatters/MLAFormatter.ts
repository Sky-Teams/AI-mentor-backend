import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";

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

  private formatPagesMLA(pages?: string | null): string {
    if (!pages || pages.trim() === "") return "";
    const parts = pages.split("-");

    if (parts.length === 2) {
      const start = parts[0]?.trim();
      const end = parts[1]?.trim();

      if (start?.length === 3 && end?.length === 3 && start[0] === end[0]) {
        return `pp. ${start}-${end.substring(1)}`;
      }
      return `pp. ${start}-${end}`;
    }
    return `p. ${pages.trim()}`;
  }

  private async formatJournal(c: JournalSearchResponse) {
    let authors = await this.formatAuthors(c?.authors);

    if (authors.endsWith("et al.")) {
      authors = authors.substring(0, authors.length - 1);
    }

    const pagesFormatted = this.formatPagesMLA(c?.page);
    const volume = c?.volume ? `vol. ${c.volume}, ` : "";
    const issue = c?.issue ? `no. ${c.issue}, ` : "";
    const year = this.getYear(c?.datePublished);
    const doiPart = c?.doi ? `  ${c.doi}` : "";
    const title = c?.title ? `"${c.title}." ` : "";
    const journalName = c?.journalName ? `${c.journalName}, ` : "";

    return `${authors}${title}${journalName}${volume}${issue}${year ? year + ", " : ""}${pagesFormatted}${doiPart}.`;
  }

  // These functions will be needed in the future.

  // private async formatBook(c: BookCitation) {
  //   const authors = await this.formateAuthors(c.authors);
  //   const edition = c.edition ? `${c.edition}, ` : "";
  //   const volume = c.volumeNumber ? `Vol. ${c.volumeNumber}, ` : "";
  //   return `${authors}. ${c.title}. ${edition}${volume} ${c.publisher ? c.publisher + ", " : ""} ${this.getYear(c.datePublished)}.`;
  // }

  // private async formatWebsite(c: WebsiteCitation) {
  //   const authors = await this.formateAuthors(c.authors);
  //   const year = this.getYear(c.datePublished);
  //   const month = c.datePublished.toLocaleString("en-US", { month: "long" });
  //   const day = c.datePublished.getDate();
  //   return `${authors}. " ${c.title}." ${c.websiteName}, ${day} ${month} ${year}, ${c.url}`;
  // }

  // private async formatReport(c: ReportCitation) {
  //   const authors = await this.formateAuthors(c.authors);
  //   return `${authors}. ${c.title}. ${c.publisher ? c.publisher + ", " : ""}${this.getYear(c.datePublished)}.`;
  // }

  public async formatAuthors(authors: any): Promise<string> {
    if (!authors) return "";

    const authorsArray = Array.isArray(authors) ? authors : [authors];
    const count = authorsArray.length;

    if (count === 0) return "";

    const initials = authorsArray.slice(0, 3).map((author) => {
      const firstName =
        author.firstName
          ?.split(" ")
          ?.map((n: string) => n.charAt(0).toUpperCase() + n.slice(1))
          ?.join(" ") || "";

      return firstName;
    });
    if (count === 1) {
      return `${authorsArray[0].lastName}, ${initials[0]}. `;
    }

    if (count === 2) {
      return `${authorsArray[0].lastName}, ${initials[0]}, and ${initials[1]} ${authorsArray[1].lastName}. `;
    }

    return `${authorsArray[0].lastName}, ${initials[0]}, et al. `;
  }

  private getYear(dateInput: any): string {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.getUTCFullYear().toString() : "";
  }
}
