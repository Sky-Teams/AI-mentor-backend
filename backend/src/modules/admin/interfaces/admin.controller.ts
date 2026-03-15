import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { AdminService } from "../application/admin.service";

export class AdminController {
  public constructor(private readonly adminService: AdminService) {}

  public async listGuidelines(_request: Request, response: Response): Promise<void> {
    const guidelinePacks = await this.adminService.listGuidelinePacks();
    response.status(StatusCodes.OK).json(successResponse(guidelinePacks));
  }

  public async upsertGuideline(request: Request, response: Response): Promise<void> {
    const guidelinePack = await this.adminService.upsertGuidelinePack(request.body);
    response.status(StatusCodes.OK).json(successResponse(guidelinePack));
  }

  public async listPromptTemplates(_request: Request, response: Response): Promise<void> {
    const templates = await this.adminService.listPromptTemplates();
    response.status(StatusCodes.OK).json(successResponse(templates));
  }

  public async upsertPromptTemplate(request: Request, response: Response): Promise<void> {
    const template = await this.adminService.upsertPromptTemplate(request.body);
    response.status(StatusCodes.OK).json(successResponse(template));
  }

  public async listPlans(_request: Request, response: Response): Promise<void> {
    const plans = await this.adminService.listPlans();
    response.status(StatusCodes.OK).json(successResponse(plans));
  }

  public async upsertPlan(request: Request, response: Response): Promise<void> {
    const plan = await this.adminService.upsertPlan(request.body);
    response.status(StatusCodes.OK).json(successResponse(plan));
  }

  public async listUsersUsage(_request: Request, response: Response): Promise<void> {
    const users = await this.adminService.listUsersUsage();
    response.status(StatusCodes.OK).json(successResponse(users));
  }
}
