import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { formatPage, getYear } from "src/shared/utils/format-citation-helper";

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
    const authors = c.authors ? await this.formatAuthor(c.authors) : "";
    const title = c.title ? ` ${c.title}.` : "";
    const year = c.datePublished ? " " + (await getYear(c.datePublished)) : "";
    const volume = c.volume ? `${year ? ";" : " "}${c.volume}` : "";
    const issue = c.issue ? `(${c.issue})` : "";
    const page = c.page ? `:${await formatPage(c.page)}` : "";
    let doi = c.doi ? ". " + c.doi : "";
    const journalNameAbbrev = c.journalNameAbbrev
      ? ` <i>${c.journalNameAbbrev.replace(/\./g, "").trim()}</i>.`
      : ` <i>${c.journalName?.replace(/\./g, "").trim()}</i>.`;

    let publicationPart = year + volume + issue + page;

    if (!publicationPart && doi) doi = ` ${c.doi}`;

    return `${authors}${title}${journalNameAbbrev}${year}${volume}${issue}${page}${doi}`;
  }

  async formatAuthor(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];
    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        .trim()
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
}
