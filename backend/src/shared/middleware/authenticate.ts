import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { TokenService } from "../../modules/auth/domain/token-service";
import { AppError } from "../errors/app-error";

export const authenticate =
  (tokenService: TokenService) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    const authorization = request.headers.authorization;
    const [, token] = authorization?.split(" ") ?? [];

    if (!token) {
      next(new AppError("Authentication token is required.", StatusCodes.UNAUTHORIZED, "UNAUTHORIZED"));
      return;
    }

    request.auth = tokenService.verifyAccessToken(token);
    next();
  };
