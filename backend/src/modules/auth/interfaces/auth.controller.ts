import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { AuthService } from "../application/auth.service";

export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  public async register(request: Request, response: Response): Promise<void> {
    const result = await this.authService.register(request.body);
    response.status(StatusCodes.CREATED).json(successResponse(result));
  }

  public async login(request: Request, response: Response): Promise<void> {
    const result = await this.authService.login(request.body);
    response.status(StatusCodes.OK).json(successResponse(result));
  }

  public async refresh(request: Request, response: Response): Promise<void> {
    const result = await this.authService.refresh(request.body.refreshToken);
    response.status(StatusCodes.OK).json(successResponse(result));
  }

  public async me(request: Request, response: Response): Promise<void> {
    const user = await this.authService.getMe(request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(user));
  }
}
