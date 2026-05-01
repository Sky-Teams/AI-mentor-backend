import { AppError } from "src/shared/errors/app-error";
import {
  BookCitation,
  CitationFormatter,
  Citation,
  JournalCitation,
  ReportCitation,
  WebsiteCitation,
} from "../domain/citation";

export class APAFormatter implements CitationFormatter {
  public async format(citation: Citation): Promise<string> {
    switch (citation.type) {
      case "BOOK":
        return this.formatBook(citation as BookCitation);
      case "WEBSITE":
        return this.formatWebsite(citation as WebsiteCitation);
      case "JOURNAL":
        return this.formatJournal(citation as JournalCitation);
      case "REPORT":
        return this.formatReport(citation as ReportCitation);
      default:
        throw new AppError(
          "Unsupported format type",
          404,
          "UNSUPPORTED_FORMAT_TYPE",
        );
    }
  }

  private async formatBook(c: BookCitation) {
    const authors = await this.formatAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    const edition = c.edition ? `${c.edition}` : "";
    const volume = c.volumeNumber ? `Vol. ${c.volumeNumber}` : "";
    return `${authors} (${year}). ${c.title} ${edition || volume ? "(" + edition + (volume && edition ? ", " : "") + volume + ")" : ""} ${c.publisher ? c.publisher + "." : ""}`;
  }

  private async formatWebsite(c: WebsiteCitation) {
    const authors = await this.formatAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    return `${authors}. (${year}, ${c.datePublished.getMonth()} ${c.datePublished.getDay()}). ${c.title}. ${c.websiteName}. ${c.url} `;
  }

  private async formatJournal(c: JournalCitation) {
    const authors = await this.formatAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    return `${authors} (${year}). ${c.title}. ${c.journalName}${c.volumeNumber ? `, ${c.volumeNumber}` : ""} ${c.issueNumber ? `(${c.issueNumber})` : ""}${c.page ? ", "+ c.page + "." : ""} ${c.doi ? c.doi : ""}`;
  }

  private async formatReport(c: ReportCitation) {
    const authors = await this.formatAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    return `${authors} (${year}). ${c.title}. ${c.publisher ? c.publisher + "." : ""} ${c.url ? c.url : ""}`;
  }

  public async formatAuthors(authors: any) {
    const authorsArray = Object.values(authors);

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
    return `${formatted.join(", ")} & ${lastAuthor}`;
  }
  
  private getYear(dateInput: any): string {
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.getUTCFullYear().toString() : "n.d.";
  }
}
