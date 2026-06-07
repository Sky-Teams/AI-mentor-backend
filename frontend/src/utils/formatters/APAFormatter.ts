import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../services/api/reference";

export class APAFormatter {
  public async format(
    reference: Reference,
    type: ReferenceTypes,
  ): Promise<string> {
    switch (type) {
      case "JOURNAL":
        return this.formatJournal(reference as JournalSearchResponse);
      default:
        return "Unsupported formate style";
    }
  }

  private async formatJournal(c: JournalSearchResponse) {
    const authors = await this.formatAuthors(c.authors);
    const year = this.getYear(c?.datePublished);
    const authorPart =
      c?.authors && c.authors.length !== 0 ? `${authors} ` : "";
    const yearPart = c?.datePublished ? `(${year}). ` : "";
    const titlePart = c?.title ? `${c.title.trim()}. ` : "";
    let publicationPart = "";
    if (c?.journalName) {
      publicationPart = c.journalName.trim();
      if (c.volume) publicationPart += `, ${c.volume}`;
      if (c.issue) publicationPart += `(${c.issue})`;
      if (c.page) publicationPart += `, ${c.page.trim()}`;
      publicationPart += "."; 
    } else if (c.page) {
      publicationPart = `${c.page.trim()}.`;
    }

    const doiPart = c.doi ? ` ${c.doi.trim()}` : "";

    return `${authorPart}${yearPart}${titlePart}${publicationPart}${doiPart}`.trim();
  }

  // These functions will be needed in the future.

  // private async formatBook(c: BookCitation) {
  //   const authors = await this.formatAuthors(c.authors);
  //   const year = this.getYear(c.datePublished);
  //   const edition = c.edition ? `${c.edition}` : "";
  //   const volume = c.volumeNumber ? `Vol. ${c.volumeNumber}` : "";
  //   return `${authors} (${year}). ${c.title} ${edition || volume ? "(" + edition + (volume && edition ? ", " : "") + volume + ")" : ""} ${c.publisher ? c.publisher + "." : ""}`;
  // }

  // private async formatWebsite(c: WebsiteCitation) {
  //   const authors = await this.formatAuthors(c.authors);
  //   const year = this.getYear(c.datePublished);
  //   const month = c.datePublished.toLocaleString("en-US", { month: "long" });
  //   const day = c.datePublished.getDate();
  //   return `${authors} (${year}, ${month} ${day}). ${c.title}. ${c.websiteName}. ${c.url}`;
  // }

  // private async formatReport(c: ReportCitation) {
  //   const authors = await this.formatAuthors(c.authors);
  //   const year = this.getYear(c.datePublished);
  //   return `${authors} (${year}). ${c.title}.${c.publisher ? " " + c.publisher + "." : ""}${c.url ? " " + c.url : ""}`;
  // }

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
    return `${formatted.join(", ")}, & ${lastAuthor}`;
  }

  private getYear(dateInput: any): string {
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.getUTCFullYear().toString() : "n.d.";
  }
}

export const apaFormatter = new APAFormatter();
