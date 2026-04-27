import { AppError } from "src/shared/errors/app-error";
import {
  Bookcitation,
  CitaionFormatter,
  Citation,
  JournalCitation,
  ReportCitation,
  WebsiteCitation,
} from "../domain/citation";

export class APAFormatter implements CitaionFormatter {
  public async format(citation: Citation): Promise<string> {
    switch (citation.type) {
      case "BOOK":
        return this.formatBook(citation as Bookcitation);
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

  private async formatBook(c: Bookcitation) {
    const authors = await this.formateAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    const edition = c.edition ? `${c.edition}, ` : "";
    console.log(c);
    
    const volume = c.volumeNumber ? `Vol. ${c.volumeNumber}, ` : "";
    return `${authors}. (${year}). ${c.title}: ${volume} (${edition} p.${c.page}) ${c.publisher ? c.publisher + "." : ""}`;
  }

  private async formatWebsite(c: WebsiteCitation) {
    const authors = await this.formateAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    return `${authors}. (${year}, ${c.datePublished.getMonth()} ${c.datePublished.getDay()}). ${c.title}. ${c.websiteName}. ${c.url} `;
  }

  private async formatJournal(c: JournalCitation) {
    const authors = await this.formateAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    const volume = c.volumeNumber ? `vol. ${c.volumeNumber}, ` : "";
    return `${authors}. (${year}). ${c.journalName}${c.volumeNumber ? `, ${c.volumeNumber}` : ""} ${c.issueNumber ? `(${c.issueNumber})` : ""}, ${c.page}.`;
  }

  private async formatReport(c: ReportCitation) {
    const authors = await this.formateAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    return `${authors}. (${year}). ${c.title} `;
  }

  public async formateAuthors(authors: any) {
    let authorsArray: any[] = [];
    if (authors.length === 1) {
      return `${authors.lastName}, ${
        authors.firstName.charAt(0).toUpperCase() + "."
      }`;
    } else {
      authorsArray = Object.values(authors);
    }
    const authorList = authorsArray.map((author) => {
      return `${author.lastName}, ${author.firstName.charAt(0).toUpperCase() + "."}`;
    });
    const lastAuthor = authorList.pop();
    return `${authorList.join(", ")} & ${lastAuthor}`;
  }

  private getYear(dateInput: any): string {
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.getUTCFullYear().toString() : "n.d.";
  }
}
