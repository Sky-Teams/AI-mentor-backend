import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/app-error";
import type { AppLogger } from "../logging/logger";

export const createErrorHandler =
  (logger: AppLogger) =>
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ): void => {
    if (error instanceof AppError) {
      logger.warn({ err: error, code: error.code }, error.message);
      response.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error({ err: error }, "Database operation failed.");
      response.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "The database rejected the operation.",
        },
      });
      return;
    }

    logger.error({ err: error }, "Unexpected error.");
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  };
