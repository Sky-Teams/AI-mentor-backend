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
    const { style, references } = request.body as {
      style: ReferenceStyle;
      references: { reference: Reference; referenceIndex: number }[];
    };

    const result = await Promise.all(
      references.map((item) =>
        this.citationFormatterService.generateCitation({
          reference: item.reference,
          style: style,
          referenceIndex: item.referenceIndex,
        }),
      ),
    );

    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
