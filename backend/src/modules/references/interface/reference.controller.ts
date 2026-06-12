import type { Request, Response } from "express";
import { ReferenceSearchService } from "../application/reference.search.service";
import { StatusCodes } from "http-status-codes";
import { successResponse } from "src/shared/http/api-response";
import {
  CreateReferenceInput,
  ReferenceStyle,
  ReferenceTypes,
} from "../domain/reference";
import { ReferenceFormatterService } from "../application/reference.formatter.service";

export class ReferenceController {
  constructor(
    private readonly referenceSearchService: ReferenceSearchService,
    private readonly referenceFormatterService: ReferenceFormatterService,
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

  public async formatReference(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { references, style } = request.body as {
      references: CreateReferenceInput[];
      style: ReferenceStyle;
    };

    const result = await Promise.all(
      references.map((item) =>
        this.referenceFormatterService.format(item.reference, item.type, style),
      ),
    );

    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
