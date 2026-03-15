import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { BillingService } from "../application/billing.service";

export class BillingController {
  public constructor(private readonly billingService: BillingService) {}

  public async getOverview(request: Request, response: Response): Promise<void> {
    const overview = await this.billingService.getOverview(request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(overview));
  }
}
