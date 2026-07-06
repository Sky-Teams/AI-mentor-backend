import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";

export class AMAFormatter {
  public async format(reference: Reference, type: ReferenceTypes) {
    switch (type) {
      case "JOURNAL":
        return this.formatJournal(reference);
      default:
        throw new AppError(
          "Unsupported reference type",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_REFERENCE_TYPE",
        );
    }
  }

  public async formatJournal(c: JournalSearchResponse) {
    const authors = await this.formateAuthor(c.authors);
    const title = c.title ? ` ${c.title}.` : "";
    const year = c.datePublished
      ? " " + (await this.getYear(c.datePublished))
      : "";
    const volume = c.volume ? ";" + c.volume : "";
    const issue = c.issue ? `(${c.issue})` : "";
    const page = c.page ? `: ${c.page}` : "";
    const doi = c.doi ? " " + c.doi : "";
    const journalNameAbbrev = c.journalNameAbbrev
      ? `<i> ${c.journalNameAbbrev.replace(/\./g, "").trim()}</i>.`
      : "";

    return `${authors}${title}${journalNameAbbrev}${year}${volume}${issue}${page}. ${doi}`;
  }

  async formateAuthor(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];
    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        .split(" ")
        .map((n: string) => n.charAt(0).toUpperCase())
        .join("");

      const lastName = author.lastName.replace(/\s+/g, "").trim();
      return `${lastName} ${initials}`;
    });

    if (formatted.length === 1) return `${formatted[0]}.`;

    if (formatted.length > 6)
      return `${formatted[0]}, ${formatted[1]}, ${formatted[3]}, et al.`;

    let lastAuthor = `${formatted.pop()}.`;

    return `${formatted.join(", ")}, ${lastAuthor}`;
  }

  async getYear(dateInput: any) {
    if (!dateInput) return "";

    const date = new Date(dateInput);
    return `${date.getFullYear()}`;
  }
}
