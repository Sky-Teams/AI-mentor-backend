import type { Request, Response } from "express";
import { CitationFormatterService } from "../application/citation.formatter.service";
import { CitationType } from "../domain/citation";
import {
  CreateReferenceInput,
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
    const { type, style, references } = request.body as {
      type: CitationType;
      style: ReferenceStyle;
      references: Omit<CreateReferenceInput, "type">[];
    };

    const result = await Promise.all(
      references.map((item) =>
        this.citationFormatterService.generateCitation(
          type,
          style,
          item.reference,
        ),
      ),
    );

    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
