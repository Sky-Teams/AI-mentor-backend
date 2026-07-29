import type { Request, Response } from "express";
import { CitationFormatterService } from "../application/citation.formatter.service";
import {
  Reference,
  ReferenceStyle,
} from "src/modules/references/domain/reference";
import { StatusCodes } from "http-status-codes";
import { successResponse } from "src/shared/http/api-response";

export class CitationController {
  constructor(
    private readonly citationFormatterService: CitationFormatterService,
  ) {}

  public async formatCitation(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { style, reference } = request.body as {
      style: ReferenceStyle;
      reference: Reference;
    };

    const result = await this.citationFormatterService.generateCitation({
      style: style,
      reference: reference,
    });

    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
