import { Router } from "express";
import { successResponse } from "../../../shared/http/api-response";

export const createHealthRouter = (): Router => {
  const router = Router();
  router.get("/", (_request, response) => {
    response.json(
      successResponse({
        status: "ok",
        timestamp: new Date().toISOString(),
      }),
    );
  });
  return router;
};
