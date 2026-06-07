import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../services/api/reference";

export class MLAFormatter {
  public async format(
    reference: Reference,
    type: ReferenceTypes,
  ): Promise<string> {
    switch (type) {
      case "JOURNAL":
        return this.formatJournal(reference as JournalSearchResponse);
      default:
        return "Unsupported format type";
    }
  }

  private formatPagesMLA(pages?: string | null): string {
    if (!pages || pages.trim() === "") return "";
    const parts = pages.split("-");

    if (parts.length === 2) {
      const start = parts[0].trim();
      const end = parts[1].trim();

      if (start.length === 3 && end.length === 3 && start[0] === end[0]) {
        return `pp. ${start}-${end.substring(1)}`;
      }
      return `pp. ${start}-${end}`;
    }
    return `p. ${pages.trim()}`;
  }

  private async formatJournal(c: JournalSearchResponse) {
    let authors = await this.formateAuthors(c.authors);

    if (authors.endsWith("et al.")) {
      authors = authors.substring(0, authors.length - 1);
    }

    const pagesFormatted = this.formatPagesMLA(c.page);
    const volume = c.volume ? `vol. ${c.volume}, ` : "";
    const issue = c.issue ? `no. ${c.issue}, ` : "";
    const year = this.getYear(c.datePublished);
    const doiPart = c.doi ? `, ${c.doi}` : "";

    return `${authors}. "${c.title}." ${c.journalName}, ${volume}${issue}${year}, ${pagesFormatted}${doiPart}.`;
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

  public async formateAuthors(authors: any): Promise<string> {
    const authorsArray = Array.isArray(authors) ? authors : [authors];
    const count = authorsArray.length;

    if (count === 0) return "n.a.";
    if (count === 1) {
      return `${authorsArray[0].lastName}, ${authorsArray[0].firstName}`;
    }

    if (count === 2) {
      return `${authorsArray[0].lastName}, ${authorsArray[0].firstName}, and ${authorsArray[1].firstName} ${authorsArray[1].lastName}`;
    }

    return `${authorsArray[0].lastName}, ${authorsArray[0].firstName}, et al.`;
  }

  private getYear(dateInput: any): string {
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.getUTCFullYear().toString() : "n.d.";
  }
}

export const mlaFormatter = new MLAFormatter();
