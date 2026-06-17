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

  public async buyPlan(request: Request, response: Response): Promise<void> {
    const { subscriptionPlanId } = request.params as {
      subscriptionPlanId: string;
    };
    const result = await this.subscriptionService.buyPlan(
      subscriptionPlanId,
      request.auth!.userId,
    );
    response.status(StatusCodes.OK).json(successResponse(result));
  }

  public async cancelRequestedPlan(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { id } = request.params as { id: string };

    const result = await this.subscriptionService.cancelRequestedPlan(
      id,
      request.auth!.userId,
    );

    response.status(StatusCodes.OK).json(successResponse(result));
  }

  public async getUserRequestedPlan(
    request: Request,
    response: Response,
  ): Promise<void> {
    const result = await this.subscriptionService.getUserRequestedPlan(
      request.auth!.userId,
    );

    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
