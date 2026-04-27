import { AppError } from "src/shared/errors/app-error";
import {
  Bookcitation,
  CitaionFormatter,
  Citation,
  JournalCitation,
  ReportCitation,
  WebsiteCitation,
} from "../domain/citation";

export class MLAFormatter implements CitaionFormatter {
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
    const edition = c.edition ? `${c.edition}, ` : "";
    const volume = c.volumeNumber ? `Vol. ${c.volumeNumber}, ` : "";
    return `${authors}. ${c.title}. ${this.getYear(c.datePublished)}. ${edition}${volume} ${c.publisher ? c.publisher + "." : ""} p.${c.page}`;
  }

  private async formatWebsite(c: WebsiteCitation) {
    const authors = await this.formateAuthors(c.authors);
    const year = this.getYear(c.datePublished);
    return `${authors}. " ${c.title}." ${year ? year + ", " : ""}${c.websiteName}, ${c.url}.`;
  }

  private async formatJournal(c: JournalCitation) {
    const authors = await this.formateAuthors(c.authors);
    const volume = c.volumeNumber ? `vol. ${c.volumeNumber}, ` : "";
    const issue = c.issueNumber ? `no. ${c.issueNumber}, ` : "";
    const year = this.getYear(c.datePublished);
    return `${authors}. "${c.title}." ${year ? year + ", " : ""}${c.journalName}, ${volume}${issue}${this.getYear(c.datePublished)}`;
  }

  private async formatReport(c: ReportCitation) {
    const authors = await this.formateAuthors(c.authors);
    return `${authors}. ${c.title}. ${this.getYear(c.datePublished)}.`;
  }

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
