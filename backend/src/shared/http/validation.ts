import { ZodError, type ZodSchema } from "zod";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/app-error";

type RequestPart = "body" | "params" | "query";

export const validate =
  <T>(schema: ZodSchema<T>, part: RequestPart = "body") =>
  (request: Request, _response: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(request[part]);
      (request as unknown as Record<string, unknown>)[part] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(
            "Request validation failed.",
            StatusCodes.UNPROCESSABLE_ENTITY,
            "VALIDATION_ERROR",
            error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          ),
        );
        return;
      }

      next(error);
    }
  };
