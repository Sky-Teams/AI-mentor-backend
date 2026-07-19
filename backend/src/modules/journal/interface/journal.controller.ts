import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { JournalService } from "src/modules/journal/application/journal.service.js";
import { successResponse } from "src/shared/http/api-response.js";
import { ProjectService } from "src/modules/projects/application/project.service.js";
import { AppError } from "src/shared/errors/app-error";

export class JournalController {
  public constructor(
    private readonly journalService: JournalService,
    private readonly projectService: ProjectService,
  ) {}

  public async getAllJournals(req: Request, res: Response): Promise<void> {
    const { specialtyId } = req.query as { specialtyId: string };

    const journals = await this.journalService.getAllJournals(specialtyId);
    res.status(StatusCodes.OK).json(successResponse(journals));
  }

  public async getJournalById(req: Request, res: Response): Promise<void> {
    const journal = await this.journalService.getJournalById(req.params.id!);
    res.status(StatusCodes.OK).json(successResponse(journal));
  }

  public async getAllSpecialties(req: Request, res: Response) {
    const specialties = await this.projectService.getAllSpecialties();
    res.status(StatusCodes.OK).json(successResponse(specialties));
  }

  public async generateFromName(req: Request, res: Response): Promise<void> {
    const { journalName } = req.body as {
      journalName?: string;
    };

    if (
      !journalName ||
      typeof journalName !== "string" ||
      !journalName.trim()
    ) {
      throw new AppError(
        "journalName is required",
        400,
        "JOURNAL_NAME_REQUIRED",
      );
    }

    const generatedJournal = await this.journalService.generateJournalFromName({
      journalName: journalName.trim(),
    });

    res.status(StatusCodes.OK).json(successResponse(generatedJournal));
  }
}
