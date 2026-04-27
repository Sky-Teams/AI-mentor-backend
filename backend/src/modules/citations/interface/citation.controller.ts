import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { CitationService } from "../application/citation.service";
import { successResponse } from "src/shared/http/api-response";

export class CitationController {
  constructor(private readonly citationService: CitationService) {}

  public async CreateCitation(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { citation, style } = request.body as any;
    const { projectId } = request.params as { projectId: string };
    const result = await this.citationService.createCitation({
      citation: citation,
      ownerId: request.auth!.userId,
      formateStyle: style,
      projectId: projectId,
    });

    response.status(StatusCodes.ACCEPTED).json(successResponse(result));
  }
}
