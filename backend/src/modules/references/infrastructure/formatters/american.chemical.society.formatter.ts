import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { formatPage, getYear } from "src/shared/utils/format-citation-helper";

export class AmericaChemicalSocietyFormatter {
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
    const authors = c.authors ? await this.formatAuthors(c.authors) : "";
    const title = c.title ? ` ${c.title}.` : "";
    const journalNameAbbrev = c.journalNameAbbrev
      ? `<i> ${c.journalNameAbbrev}</i>`
      : `<i> ${c.journalName?.replace(/\./g, "").trim()}</i>.`;
    const year = c.datePublished
      ? `<b> ${await getYear(c.datePublished)}</b>,`
      : "";
    const volume = c.volume ? `<i> ${c.volume}</i>${c.issue ? "" : ","}` : "";
    const issue = c.issue ? `(${c.issue}),` : "";
    const page = c.page ? ` ${await formatPage(c.page)}.` : "";
    const doi = c.doi ? ` ${c.doi}` : "";
    return `${authors}${title}${journalNameAbbrev}${year}${volume}${issue}${page}${doi}`;
  }

  async formatAuthors(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];

    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      const initials = author.firstName
        .trim()
        ?.split(" ")
        .map((n: string) => n.charAt(0).toUpperCase())
        .join(". ");

      return `${author.lastName}, ${initials}.`;
    });

    if (formatted.length === 1) return formatted[0];

    if (formatted.length > 10) {
      return `${formatted[0]}, ${formatted[1]}, ${formatted[2]}, et al.`;
    }
    const lastAuthor = formatted.pop();

    return `${formatted.join(", ")}, ${lastAuthor}`;
  }
}
