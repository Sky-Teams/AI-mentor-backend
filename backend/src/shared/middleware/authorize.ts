import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { Role } from "../../modules/users/domain/user";
import { AppError } from "../errors/app-error";

export const authorize =
  (...roles: Role[]) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.auth) {
      next(new AppError("Authentication is required.", StatusCodes.UNAUTHORIZED, "UNAUTHORIZED"));
      return;
    }

    if (!roles.includes(request.auth.role)) {
      next(new AppError("You do not have access to this resource.", StatusCodes.FORBIDDEN, "FORBIDDEN"));
      return;
    }

    next();
  };
