import type { Request, Response } from "express";
import { ParaphraseService } from "../application/paraphrase.service";
import { LengthStrategy, ParaphraseRun, ToneType } from "../domain/paraphrase";
import { StatusCodes } from "http-status-codes";
import { successResponse } from "src/shared/http/api-response";

export class ParaphraseController {
  public constructor(private readonly paraphraseService: ParaphraseService) {}

  public async createParaphrase(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    const paraphraseRun = await this.paraphraseService.triggerSectionParaphrase(
      {
        projectId: projectId,
        sectionId: request.body.sectionId,
        ownerId: request.auth!.userId,
        tone: request.body.tone,
        preservedWords: request.body.preservedWords,
        lengthStrategy: request.body.lengthStrategy,
      },
    );
    response.status(StatusCodes.ACCEPTED).json(successResponse(paraphraseRun));
  }

  public async getSectionParaphrase(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { projectId, sectionId } = request.query as {
      projectId: string;
      sectionId: string;
    };
    const ownerId = request.auth!.userId;
    const paraphraseSections =
      await this.paraphraseService.listSectionParaphrase(
        projectId,
        sectionId,
        ownerId,
      );
    response.status(StatusCodes.OK).json(successResponse(paraphraseSections));
  }

  public async getParaphraseRun(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { paraphraseRunId } = request.params as {
      paraphraseRunId: string;
    };
    const ownerId = request.auth!.userId;
    const paraphrase = await this.paraphraseService.getParaphraseRun(
      paraphraseRunId,
      ownerId,
    );

    response.status(StatusCodes.OK).json(successResponse(paraphrase));
  }

  public async deleteParaphraseRun(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { paraphraseRunId } = request.params as {
      paraphraseRunId: string;
    };
    const ownerId = request.auth!.userId;
    await this.paraphraseService.deleteParaphraseRun(paraphraseRunId, ownerId);

    response.status(StatusCodes.OK).json({
      message: "Paraphrase run deleted successfully",
    });
  }
}
