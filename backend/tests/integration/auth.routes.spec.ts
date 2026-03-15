import express from "express";
import request from "supertest";
import { describe, expect, it, jest } from "@jest/globals";
import { createAuthRouter } from "../../src/modules/auth/interfaces/auth.routes";
import type { AuthController } from "../../src/modules/auth/interfaces/auth.controller";
import type { TokenService } from "../../src/modules/auth/domain/token-service";

const buildApp = () => {
  const app = express();
  app.use(express.json());

  const controller: jest.Mocked<AuthController> = {
    register: jest.fn(async (_request, response) => {
      response.status(201).json({ success: true, data: { ok: true } });
    }),
    login: jest.fn(async (_request, response) => {
      response.status(200).json({ success: true, data: { ok: true } });
    }),
    refresh: jest.fn(async (_request, response) => {
      response.status(200).json({ success: true, data: { ok: true } });
    }),
    me: jest.fn(async (_request, response) => {
      response.status(200).json({ success: true, data: { id: "user-1" } });
    }),
  } as unknown as jest.Mocked<AuthController>;

  const tokenService: jest.Mocked<TokenService> = {
    issueTokens: jest.fn(),
    verifyAccessToken: jest.fn().mockReturnValue({
      userId: "user-1",
      role: "USER",
      email: "demo@example.com",
    }),
    verifyRefreshToken: jest.fn(),
    getRefreshTokenExpiryDate: jest.fn(),
  };

  app.use("/api/v1/auth", createAuthRouter(controller, tokenService));
  app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(422).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: error.message },
    });
  });

  return { app, controller };
};

describe("auth routes", () => {
  it("validates register payloads", async () => {
    const { app } = buildApp();
    const response = await request(app).post("/api/v1/auth/register").send({
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(422);
  });

  it("requires a bearer token for /me", async () => {
    const { app } = buildApp();
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(422);
  });
});
