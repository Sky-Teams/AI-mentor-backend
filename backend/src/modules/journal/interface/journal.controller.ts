import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { JournalService } from "src/modules/journal/application/journal.service.js";
import { successResponse } from "src/shared/http/api-response.js";

export class JournalController {
  public constructor(private readonly journalService: JournalService) {}

  public async listJournals(req: Request, res: Response): Promise<void> {
    const journals = await this.journalService.listJournals(req.auth!.userId);
    res.status(StatusCodes.OK).json(successResponse(journals));
  }
}
