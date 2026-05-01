import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { PrismaClient } from "@prisma/client";
import { env } from "./shared/config/env";
import { openApiSpec } from "./shared/docs/openapi";
import { createErrorHandler } from "./shared/middleware/error-handler";
import { logger } from "./shared/logging/logger";
import { ArgonPasswordHasher } from "./modules/auth/infrastructure/argon-password-hasher";
import { JwtTokenService } from "./modules/auth/infrastructure/jwt-token-service";
import { PrismaAuthRepository } from "./modules/auth/infrastructure/prisma-auth.repository";
import { AuthService } from "./modules/auth/application/auth.service";
import { AuthController } from "./modules/auth/interfaces/auth.controller";
import { createAuthRouter } from "./modules/auth/interfaces/auth.routes";
import { PrismaProjectRepository } from "./modules/projects/infrastructure/prisma-project.repository";
import { ProjectService } from "./modules/projects/application/project.service";
import { ProjectController } from "./modules/projects/interfaces/project.controller";
import { createProjectRouter } from "./modules/projects/interfaces/project.routes";
import { PrismaBillingRepository } from "./modules/billing/infrastructure/prisma-billing.repository";
import { BillingService } from "./modules/billing/application/billing.service";
import { BillingController } from "./modules/billing/interfaces/billing.controller";
import { createBillingRouter } from "./modules/billing/interfaces/billing.routes";
import { OpenAiSectionReviewer } from "./modules/reviews/infrastructure/openai-section-reviewer";
import { PrismaReviewRepository } from "./modules/reviews/infrastructure/prisma-review.repository";
import { ReviewService } from "./modules/reviews/application/review.service";
import { ReviewController } from "./modules/reviews/interfaces/review.controller";
import { createReviewRouter } from "./modules/reviews/interfaces/review.routes";
import { PrismaAdminRepository } from "./modules/admin/infrastructure/prisma-admin.repository";
import { AdminService } from "./modules/admin/application/admin.service";
import { AdminController } from "./modules/admin/interfaces/admin.controller";
import { createAdminRouter } from "./modules/admin/interfaces/admin.routes";
import { createHealthRouter } from "./modules/health/interfaces/health.routes";
import { ParaphraseController } from "./modules/paraphrasing/interface/paraphrase.controller";
import { ParaphraseService } from "./modules/paraphrasing/application/paraphrase.service";
import { PrismaParaphraseRepository } from "./modules/paraphrasing/infrastructure/prisma-paraphrase.repository";
import { OpenAiSectionParaphrase } from "./modules/paraphrasing/infrastructure/openai-section-paraphrase";
import { createParaphraseRouter } from "./modules/paraphrasing/interface/paraphrase.routes";
import { ReviewCreditEstimatorService } from "./modules/billing/application/review-credit-estimator.service";

export const createApp = (): express.Express => {
  const prisma = new PrismaClient();
  const passwordHasher = new ArgonPasswordHasher();
  const tokenService = new JwtTokenService();

  const authRepository = new PrismaAuthRepository(prisma);
  const projectRepository = new PrismaProjectRepository(prisma);
  const billingRepository = new PrismaBillingRepository(prisma);
  const reviewRepository = new PrismaReviewRepository(prisma);
  const adminRepository = new PrismaAdminRepository(prisma);
  const paraphraseRepository = new PrismaParaphraseRepository(prisma);

  const authService = new AuthService(
    authRepository,
    passwordHasher,
    tokenService,
  );
  const projectService = new ProjectService(projectRepository);
  const billingService = new BillingService(billingRepository);
  const reviewCreditEstimator = new ReviewCreditEstimatorService();
  const reviewService = new ReviewService(
    reviewRepository,
    projectService,
    new OpenAiSectionReviewer(),
    billingService,
    reviewCreditEstimator,
  );
  const adminService = new AdminService(adminRepository);
  const paraphraseService = new ParaphraseService(
    paraphraseRepository,
    projectService,
    billingService,
    new OpenAiSectionParaphrase(),
  );

  const authController = new AuthController(authService);
  const projectController = new ProjectController(projectService);
  const reviewController = new ReviewController(reviewService);
  const billingController = new BillingController(billingService);
  const adminController = new AdminController(adminService);
  const paraphraseController = new ParaphraseController(paraphraseService);

  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(","),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
    }),
  );
  app.use(pinoHttp({ logger: logger as never }));

  if (env.SWAGGER_ENABLED) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  }

  app.use(`${env.API_PREFIX}/health`, createHealthRouter());
  app.use(
    `${env.API_PREFIX}/auth`,
    createAuthRouter(authController, tokenService),
  );
   app.use(
    `${env.API_PREFIX}/projects/paraphrase`,
    createParaphraseRouter(paraphraseController, tokenService),
  );
  app.use(
    `${env.API_PREFIX}/projects`,
    createProjectRouter(projectController, tokenService),
  );
  app.use(
    `${env.API_PREFIX}`,
    createReviewRouter(reviewController, tokenService),
  );
  app.use(
    `${env.API_PREFIX}/billing`,
    createBillingRouter(billingController, tokenService),
  );
  app.use(
    `${env.API_PREFIX}/admin`,
    createAdminRouter(adminController, tokenService),
  );

  app.use(createErrorHandler(logger));
  return app;
};
