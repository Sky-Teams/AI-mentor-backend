import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import { SubscriptionService } from "../application/subscription.service";

export class SubscriptionController {
  public constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  public async listPlans(request: Request, response: Response): Promise<void> {
    const plans = await this.subscriptionService.listPlans();
    response.status(StatusCodes.OK).json(successResponse(plans));
  }
}
