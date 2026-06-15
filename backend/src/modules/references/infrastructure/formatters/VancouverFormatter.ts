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
    const authors = await this.formatAuthors(c?.authors);
    const year = await this.getYear(c?.datePublished);

    const authorPart = authors ? `${authors}. ` : "";
    const journalName = c?.journalName
      ? `${c.journalName.replace(/&amp;/g, "&").trim()}. `
      : "";
    const title = c?.title ? `${c.title}. ` : "";
    const formatPages = this.formatPages(c?.page);

    let citationDetails = year;
    if (c?.volume || c?.page || c?.issue) {
      citationDetails += ";";
      if (c?.volume) citationDetails += c.volume;
      if (c?.issue) citationDetails += `(${c.issue})`;
      if (c?.page) {
        if (c?.volume || c?.issue) {
          citationDetails += `:${formatPages}`;
        } else {
          citationDetails += formatPages;
        }
      }
    }

    citationDetails += ".";

    const doiPart = c?.doi ? ` ${c.doi}` : "";

    return `${authorPart}${title}${journalName}${citationDetails}${doiPart}`;
  }

  private async formatAuthors(authors: any) {
    if (!authors) return "";

    const changeToArray = Array.isArray(authors) ? authors : [authors];
    const authorsArray = Object.values(changeToArray);
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

  private formatPages(pages?: string | null): string {
    if (!pages || pages.trim() === "") return "";
    const parts = pages.split("-");

    if (parts.length === 2) {
      const start = parts[0]?.trim();
      const end = parts[1]?.trim();

      if (start?.length === 3 && end?.length === 3 && start[0] === end[0]) {
        return ` ${start}-${end.substring(1)}`;
      }
      return ` ${start}-${end}`;
    }
    return ` ${pages.trim()}`;
  }

  private getYear(dateInput: any): string {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.getUTCFullYear().toString() : "";
  }
}
