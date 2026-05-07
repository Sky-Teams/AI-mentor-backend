import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { JournalService } from "src/modules/journal/application/journal.service.js";
import { successResponse } from "src/shared/http/api-response.js";

export class JournalController {
  public constructor(private readonly journalService: JournalService) {}

  public async getAllJournals(req: Request, res: Response): Promise<void> {
    const journals = await this.journalService.getAllJournals();
    res.status(StatusCodes.OK).json(successResponse(journals));
  }

  public async getJournalById(req: Request, res: Response): Promise<void> {
    const journal = await this.journalService.getJournalById(req.params.id!);
    res.status(StatusCodes.OK).json(successResponse(journal));
  }
}
