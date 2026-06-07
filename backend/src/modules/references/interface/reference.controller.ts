import type { Request, Response } from "express";
import { ReferenceSearchService } from "../application/reference.search.service";
import { StatusCodes } from "http-status-codes";
import { successResponse } from "src/shared/http/api-response";
import { ReferenceTypes } from "../domain/reference";

export class ReferenceController {
  constructor(
    private readonly referenceSearchService: ReferenceSearchService,
  ) {}

  public async getReferences(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { type } = request.query as { type: ReferenceTypes };

    const result = await this.referenceSearchService.referenceSearch(
      request.query,
      type,
    );

    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
