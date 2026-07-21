import { AppError } from "src/shared/errors/app-error";
import {
  JournalSearchResponse,
  Reference,
  ReferenceTypes,
} from "../../domain/reference";
import { StatusCodes } from "http-status-codes";
import { getYear } from "src/shared/utils/format-citation-helper";

export class ChicagoAuthorDateFormatter {
  public async format(
    reference: Reference,
    type: ReferenceTypes,
  ): Promise<string> {
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

  private async formatJournal(c: JournalSearchResponse) {
    const authors = c.authors ? await this.formatAuthor(c.authors) : "";

    let publicationPart = "";
    if (c.datePublished)
      publicationPart += ` ${await getYear(c.datePublished)}.`;
    if (c.title) publicationPart += ` “${c.title}.”`;

    if (c.journalName) publicationPart += ` <i>${c.journalName}</i>`;

    if (c.volume) publicationPart += ` ${c.volume}`;
    if (c.issue) publicationPart += ` (${c.issue})`;
    if (c.page) publicationPart += `: ${await this.formatPage(c.page)}`;
    if (publicationPart) publicationPart += ".";

    const doiPart = c.doi
      ? ` https://doi.org/${c.doi.replace(/^https?:\/\/doi\.org\//, "")}.`
      : "";
    return `${authors}${publicationPart}${doiPart}`;
  }

  private async formatAuthor(authors: any) {
    if (!authors) return "";

    const authorsArray = Object.values(authors) as any[];

    if (authorsArray.length === 0) return "";

    const first = authorsArray.shift();

    const firstAuthor = `${first.lastName}, ${first.firstName}`;

    const restAuthors = authorsArray.map(
      (author: any) => `${author.firstName} ${author.lastName}`,
    );

    if (restAuthors.length === 0) {
      return `${firstAuthor}.`;
    }

    if (restAuthors.length > 9) {
      return `${firstAuthor}, ${restAuthors.slice(0, 9).join(", ")}, et al.`;
    }

    if (restAuthors.length === 1) {
      return `${firstAuthor}, and ${restAuthors[0]}.`;
    }

    const lastAuthor = restAuthors.pop();

    return `${firstAuthor}, ${restAuthors.join(", ")}, and ${lastAuthor}.`;
  }

  private async formatPage(pages: string) {
    if (!pages) return "";

    if (!pages.includes("-")) return pages;

    const listOfPages = pages.split("-");
    if (listOfPages.length > 2) return pages;

    if (listOfPages.length === 2 && listOfPages[0] == listOfPages[1])
      return listOfPages[0];

    if (listOfPages[0]?.length !== listOfPages[1]?.length) return pages;

    let sharedIndex = 0;

    const start = listOfPages[0];
    let end = listOfPages[1];
    while (
      sharedIndex < listOfPages[0]?.length! &&
      start![sharedIndex] === end![sharedIndex]
    ) {
      sharedIndex++;
    }
    end = end?.slice(sharedIndex);
    return `${start}-${end}`;
  }
}
