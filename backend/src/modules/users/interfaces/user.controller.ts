import { StatusCodes } from "http-status-codes";
import { UserService } from "../application/user.service";
import type { Request, Response } from "express";
import { successResponse } from "src/shared/http/api-response";

export class UserController {
  constructor(private readonly userService: UserService) {}

  public async changePassword(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { currentPassword, newPassword } = request.body as {
      currentPassword: string;
      newPassword: string;
    };

    const result = await this.userService.changePassword(
      request.auth!.userId,
      currentPassword,
      newPassword,
    );

    response.status(StatusCodes.OK).json(successResponse(result));
  }

  public async updateProfile(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { fullName } = request.body;
    const result = await this.userService.updateProfile(
      request.auth!.userId,
      fullName,
    );

    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
