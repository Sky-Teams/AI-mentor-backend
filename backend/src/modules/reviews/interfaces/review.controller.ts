import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { ReviewService } from "../application/review.service";

export class ReviewController {
  public constructor(private readonly reviewService: ReviewService) {}

  public async triggerReview(request: Request, response: Response): Promise<void> {
    const reviewRun = await this.reviewService.triggerSectionReview({
      ownerId: request.auth!.userId,
      projectId: request.params.projectId,
      sectionKey: request.body.sectionKey,
    });
    response.status(StatusCodes.ACCEPTED).json(successResponse(reviewRun));
  }

  public async listProjectReviews(request: Request, response: Response): Promise<void> {
    const reviews = await this.reviewService.listProjectReviews(
      request.params.projectId,
      request.auth!.userId,
    );
    response.status(StatusCodes.OK).json(successResponse(reviews));
  }

  public async getReviewRun(request: Request, response: Response): Promise<void> {
    const review = await this.reviewService.getReviewRun(request.params.reviewRunId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(review));
  }

  public async listIssues(request: Request, response: Response): Promise<void> {
    const issues = await this.reviewService.listProjectIssues(request.params.projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(issues));
  }

  public async updateIssue(request: Request, response: Response): Promise<void> {
    const issue = await this.reviewService.updateIssueStatus({
      issueId: request.params.issueId,
      ownerId: request.auth!.userId,
      status: request.body.status,
    });
    response.status(StatusCodes.OK).json(successResponse(issue));
  }

  public async getReadiness(request: Request, response: Response): Promise<void> {
    const readiness = await this.reviewService.getReadiness(request.params.projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(readiness));
  }
}
