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
import { CreditEstimatorService } from "./modules/billing/application/credit-estimator.service";
import { PrismaUserRepository } from "./modules/users/infrastructure/prisma-user.repository";
import { JournalController } from "src/modules/journal/interface/journal.controller.js";
import { JournalService } from "src/modules/journal/application/journal.service.js";
import { createJournalRouter } from "src/modules/journal/interface/journal.routes.js";
import { PrismaJournalRepository } from "src/modules/journal/infrastructure/prisma-journal.repository.js";
import { ReferenceController } from "./modules/references/interface/reference.controller";
import { createReferenceRouter } from "./modules/references/interface/reference.routes";
import { ReferenceSearchService } from "./modules/references/application/reference.search.service";
import { JournalReferenceService } from "./modules/references/application/journal.reference.search.service";
import { JournalExternalApiRepository } from "./modules/references/infrastructure/journal.external-api.repository";
import { PrismaSubscriptionRepository } from "./modules/subscription/infrastructure/prisma-subscription.repository";
import { SubscriptionService } from "./modules/subscription/application/subscription.service";
import { SubscriptionController } from "./modules/subscription/interfaces/subscription.controller";
import { createSubscriptionRouter } from "./modules/subscription/interfaces/subscription.routes";
import { ReferenceFormatterService } from "./modules/references/application/reference.formatter.service";
import { APAFormatter } from "./modules/references/infrastructure/formatters/apa.formatter";
import { MLAFormatter } from "./modules/references/infrastructure/formatters/mla.formatter";
import { VancouverFormatter } from "./modules/references/infrastructure/formatters/vancouver.formatter";
import { UserService } from "./modules/users/application/user.service";
import { UserController } from "./modules/users/interfaces/user.controller";
import { createUserRoute } from "./modules/users/interfaces/user.routes";
import { HarvardFormatter } from "./modules/references/infrastructure/formatters/harvard.formatter";
import { IEEEFormatter } from "./modules/references/infrastructure/formatters/IEEE.formatter";
import { ChicagoAuthorDateFormatter } from "./modules/references/infrastructure/formatters/chicago.author.date.formatter";
import { ChicagoFullNoteFormatter } from "./modules/references/infrastructure/formatters/chicago.full.note.formatter";
import { OSCOLAFormatter } from "./modules/references/infrastructure/formatters/OSCOLA.formatter";
import { AMAFormatter } from "./modules/references/infrastructure/formatters/ama.formatter";
import { AmericaChemicalSocietyFormatter } from "./modules/references/infrastructure/formatters/american.chemical.society.formatter";
import { APACitationFormatter } from "./modules/citation/infrastructure/formatters/apa.formatter";
import { CitationFormatterService } from "./modules/citation/application/citation.formatter.service";
import { CitationController } from "./modules/citation/interface/citation.controller";
import { createCitationRouter } from "./modules/citation/interface/citation.routes";
import { JournalSearchRepository } from "src/modules/journal/infrastructure/journal-search.repository.js";
import { ChicagoAuthorDateCitationFormatter } from "./modules/citation/infrastructure/formatters/chicago.author.date.formatter";
import { HarvardCitationFormatter } from "./modules/citation/infrastructure/formatters/harvard.formatter";
import { MLACitationFormatter } from "./modules/citation/infrastructure/formatters/mla.formatter";

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
  const userRepository = new PrismaUserRepository(prisma);
  const subscriptionRepository = new PrismaSubscriptionRepository(prisma);

  const authService = new AuthService(
    authRepository,
    passwordHasher,
    tokenService,
  );
  const projectService = new ProjectService(projectRepository);
  const billingService = new BillingService(billingRepository);
  const CreditEstimator = new CreditEstimatorService();
  const reviewService = new ReviewService(
    reviewRepository,
    projectService,
    new OpenAiSectionReviewer(),
    billingService,
    CreditEstimator,
  );
  const journalExternalApiRepository = new JournalExternalApiRepository();
  const journalReferenceService = new JournalReferenceService(
    journalExternalApiRepository,
  );
  const adminService = new AdminService(adminRepository);
  const paraphraseService = new ParaphraseService(
    paraphraseRepository,
    projectService,
    billingService,
    new OpenAiSectionParaphrase(),
    CreditEstimator,
    reviewRepository,
    userRepository,
  );
  const apa = new APAFormatter();
  const mla = new MLAFormatter();
  const vancouver = new VancouverFormatter();
  const harvard = new HarvardFormatter();
  const ieee = new IEEEFormatter();
  const chicagoAuthorDate = new ChicagoAuthorDateFormatter();
  const chicagoFullNote = new ChicagoFullNoteFormatter();
  const oscola = new OSCOLAFormatter();
  const ama = new AMAFormatter();
  const americanChemicalSociety = new AmericaChemicalSocietyFormatter();
  const referenceFormatterService = new ReferenceFormatterService(
    apa,
    mla,
    vancouver,
    harvard,
    ieee,
    chicagoAuthorDate,
    chicagoFullNote,
    oscola,
    ama,
    americanChemicalSociety,
  );
  /** Citation Formatter */
  const apaCitationFormat = new APACitationFormatter();
  const chicagoAuthorDateCitationFormat =
    new ChicagoAuthorDateCitationFormatter();
  const harvardCitationFormat = new HarvardCitationFormatter();
  const mlaCitationFormat = new MLACitationFormatter();
  const citationFormatterService = new CitationFormatterService(
    apaCitationFormat,
    chicagoAuthorDateCitationFormat,
    harvardCitationFormat,
    mlaCitationFormat,
  );

  const referenceService = new ReferenceSearchService(journalReferenceService);
  const subscriptionService = new SubscriptionService(
    subscriptionRepository,
    userRepository,
  );
  const journalRepository = new PrismaJournalRepository(prisma);
  const journalSearchRepository = new JournalSearchRepository();
  const journalService = new JournalService(
    journalRepository,
    journalSearchRepository,
  );

  const userService = new UserService(passwordHasher, userRepository);

  const authController = new AuthController(authService);
  const projectController = new ProjectController(projectService);
  const reviewController = new ReviewController(reviewService);
  const billingController = new BillingController(billingService);
  const adminController = new AdminController(
    adminService,
    subscriptionService,
    journalService,
  );
  const paraphraseController = new ParaphraseController(paraphraseService);
  const journalController = new JournalController(
    journalService,
    projectService,
  );
  const referenceController = new ReferenceController(
    referenceService,
    referenceFormatterService,
  );
  const citationController = new CitationController(citationFormatterService);
  const subscriptionController = new SubscriptionController(
    subscriptionService,
  );
  const userController = new UserController(userService);

  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: "*",
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

  app.use(
    `${env.API_PREFIX}/journals`,
    createJournalRouter(journalController, tokenService),
  );

  app.use(
    `${env.API_PREFIX}/references`,
    createReferenceRouter(referenceController, tokenService),
  );

  app.use(
    `${env.API_PREFIX}/citations`,
    createCitationRouter(citationController, tokenService),
  );

  app.use(
    `${env.API_PREFIX}/subscriptions`,
    createSubscriptionRouter(subscriptionController, tokenService),
  );

  app.use(
    `${env.API_PREFIX}/user`,
    createUserRoute(userController, tokenService),
  );

  app.use(createErrorHandler(logger));
  return app;
};
