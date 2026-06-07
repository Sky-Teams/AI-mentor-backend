import { AppError } from "src/shared/errors/app-error";
import { ReferenceTypes } from "../domain/reference";
import { JournalReferenceService } from "./journal.reference.search.service";
import { StatusCodes } from "http-status-codes";

export class ReferenceSearchService {
  public constructor(
    private readonly journalReferenceService: JournalReferenceService,
  ) {}

  public async referenceSearch(
    input: { doi?: string; title?: string },
    type: ReferenceTypes,
  ) {
    switch (type) {
      case "JOURNAL":
        return await this.journalReferenceService.searchJournals(input);
      default:
        throw new AppError(
          "Unsupported reference type",
          StatusCodes.BAD_REQUEST,
          "UNSUPPORTED_REFERENCE_TYPE",
        );
    }
  }
}
