import { Reference } from "src/modules/references/domain/reference";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";
import { CitationType } from "../../domain/citation";
import { getYear } from "src/shared/utils/format-citation-helper";

export class APACitationFormatter {
  public async formatCitation(
    type: CitationType,
    reference: Reference,
  ): Promise<string> {
    switch (type) {
      case "IN_TEXT":
        return this.InTextCitationFormat(reference);
      default:
        throw new AppError(
          "Unsupported citation type",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_CITATION_TYPE",
        );
    }
  }

  private async InTextCitationFormat(reference: Reference): Promise<string> {
    const year = reference?.datePublished
      ? await getYear(reference.datePublished)
      : "";

    const authors =
      reference?.authors && reference.authors?.length !== 0
        ? `${await this.formatAuthor(reference.authors)}${year ? ", " : ""}`
        : "";

    let publicationPart = year || authors ? `(${authors}${year})` : "";
    return publicationPart;
  }

  private async formatAuthor(authors: any) {
    if (!authors) return "";

    const authorsArray = authors ? Object.values(authors) : [];

    if (authorsArray.length === 0) return "";

    const formatted = authorsArray.map((author: any) => {
      return author.lastName;
    });

    if (formatted.length === 1) return formatted[0];

    if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;

    return `${formatted[0]} et al.`;
  }
}
