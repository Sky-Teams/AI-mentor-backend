import express from "express";
import request from "supertest";
import { describe, expect, it } from "@jest/globals";
import { createHealthRouter } from "../../src/modules/health/interfaces/health.routes";

describe("GET /health", () => {
  it("returns a healthy response envelope", async () => {
    const app = express();
    app.use("/api/v1/health", createHealthRouter());

    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });
});
