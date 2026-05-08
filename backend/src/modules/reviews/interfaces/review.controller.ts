import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { ReviewService } from "../application/review.service";
import type { ReviewIssue } from "../domain/review";

export class ReviewController {
  public constructor(private readonly reviewService: ReviewService) {}

  public async triggerReview(request: Request, response: Response): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    const reviewRun = await this.reviewService.triggerSectionReview({
      ownerId: request.auth!.userId,
      projectId,
      sectionKey: request.body.sectionKey as string,
    });
    response.status(StatusCodes.ACCEPTED).json(successResponse(reviewRun));
  }

  public async listProjectReviews(request: Request, response: Response): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    const reviews = await this.reviewService.listProjectReviews(
      projectId,
      request.auth!.userId,
    );
    response.status(StatusCodes.OK).json(successResponse(reviews));
  }

  public async getReviewRun(request: Request, response: Response): Promise<void> {
    const { reviewRunId } = request.params as { reviewRunId: string };
    const review = await this.reviewService.getReviewRun(reviewRunId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(review));
  }

  public async listIssues(request: Request, response: Response): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    const issues = await this.reviewService.listProjectIssues(projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(issues));
  }

  public async updateIssue(request: Request, response: Response): Promise<void> {
    const { issueId } = request.params as { issueId: string };
    const issue = await this.reviewService.updateIssueStatus({
      issueId,
      ownerId: request.auth!.userId,
      status: request.body.status as ReviewIssue["status"],
    });
    response.status(StatusCodes.OK).json(successResponse(issue));
  }

  public async getReadiness(request: Request, response: Response): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    const readiness = await this.reviewService.getReadiness(projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(readiness));
  }
}
