import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";

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
    const authors = await this.formatAuthors(c.authors);
    const year = await this.getYear(c.datePublished);

    const authorPart = authors ? `${authors}. ` : "";
    const journalName = c.journalName
      ? `${c.journalName.replace(/&amp;/g, "&").trim()}. `
      : "";
    const title = c.title ? `${c.title}. ` : "";

    let citationDetails = year;
    if (c.volume || c.page || c.issue) {
      citationDetails += ";";
      if (c.volume) citationDetails += c.volume;
      if (c.issue) citationDetails += `(${c.issue})`;
      if (c.page) {
        if (c.volume || c.issue) {
          citationDetails += `:${c.page.trim()}`;
        } else {
          citationDetails += c.page.trim();
        }
      }
    }

    citationDetails += ".";

    const doiPart = c.doi ? ` ${c.doi}` : "";

    return `${authorPart}${title}${journalName}${citationDetails}${doiPart}`;
  }

  private async formatAuthors(authors: any) {
    const authorsArray = Object.values(authors);
    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        .split(" ")
        .map((n: string) => n.charAt(0).toUpperCase() + "")
        .join("");

      const lastNameClean = author.lastName.replace(/\s+/g, "").trim();
      return `${lastNameClean} ${initials}`;
    });

    if (authorsArray.length > 6) {
      const firstSix = formatted.slice(0, 6);
      return `${firstSix.join(", ")}, et al`;
    }

    return formatted.join(", ");
  }

  private getYear(dateInput: any): string {
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.getUTCFullYear().toString() : "n.d.";
  }
}
