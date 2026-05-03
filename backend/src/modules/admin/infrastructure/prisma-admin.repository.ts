import { PrismaClient, type Prisma } from "@prisma/client";
import type { SubscriptionPlan } from "../../billing/domain/billing";
import type { AdminRepository } from "../domain/admin.repository";
import type {
  AdminUsageUserSummary,
  GuidelinePack,
  PromptTemplate,
  PlanUpsertInput,
} from "../domain/admin";

const mapGuidelinePack = (guidelinePack: {
  id: string;
  name: string;
  code: string;
  version: string;
  description: string | null;
  manuscriptType: "CASE_REPORT";
  status: GuidelinePack["status"];
  rules: unknown;
  isDefault: boolean;
}): GuidelinePack => ({
  id: guidelinePack.id,
  name: guidelinePack.name,
  code: guidelinePack.code,
  version: guidelinePack.version,
  description: guidelinePack.description,
  manuscriptType: guidelinePack.manuscriptType,
  status: guidelinePack.status,
  rules: guidelinePack.rules as Record<string, unknown>,
  isDefault: guidelinePack.isDefault,
});

const mapPromptTemplate = (template: {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: PromptTemplate["type"];
  version: number;
  status: PromptTemplate["status"];
  templateText: string;
  responseSchema: unknown;
  config: unknown;
}): PromptTemplate => ({
  id: template.id,
  name: template.name,
  code: template.code,
  description: template.description,
  type: template.type,
  version: template.version,
  status: template.status,
  templateText: template.templateText,
  responseSchema:
    (template.responseSchema as Record<string, unknown> | null) ?? null,
  config: (template.config as Record<string, unknown> | null) ?? null,
});

const mapPlan = (plan: {
  id: string;
  name: string;
  code: string;
  description: string | null;
  billingModel: SubscriptionPlan["billingModel"];
  monthlyPriceCents: number | null;
  includedCredits: number;
  status: SubscriptionPlan["status"];
}): SubscriptionPlan => ({
  id: plan.id,
  name: plan.name,
  code: plan.code,
  description: plan.description,
  billingModel: plan.billingModel,
  monthlyPriceCents: plan.monthlyPriceCents,
  includedCredits: plan.includedCredits,
  status: plan.status,
});

export class PrismaAdminRepository implements AdminRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listGuidelinePacks(): Promise<GuidelinePack[]> {
    const guidelinePacks = await this.prisma.guidelinePack.findMany({
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return guidelinePacks.map(mapGuidelinePack);
  }

  public async upsertGuidelinePack(input: {
    id?: string;
    name: string;
    code: string;
    version: string;
    description?: string;
    status: GuidelinePack["status"];
    rules: Record<string, unknown>;
    isDefault: boolean;
  }): Promise<GuidelinePack> {
    const guidelinePack = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        if (input.isDefault) {
          await transaction.guidelinePack.updateMany({
            where: {
              isDefault: true,
              NOT: input.id ? { id: input.id } : undefined,
            },
            data: {
              isDefault: false,
            },
          });
        }

        if (input.id) {
          return transaction.guidelinePack.update({
            where: {
              id: input.id,
            },
            data: {
              name: input.name,
              code: input.code,
              version: input.version,
              description: input.description,
              status: input.status,
              rules: input.rules as Prisma.InputJsonValue,
              isDefault: input.isDefault,
            },
          });
        }

        return transaction.guidelinePack.create({
          data: {
            name: input.name,
            code: input.code,
            version: input.version,
            description: input.description,
            status: input.status,
            rules: input.rules as Prisma.InputJsonValue,
            isDefault: input.isDefault,
          },
        });
      },
    );

    return mapGuidelinePack(guidelinePack);
  }

  public async listPromptTemplates(): Promise<PromptTemplate[]> {
    const templates = await this.prisma.promptTemplate.findMany({
      orderBy: [{ code: "asc" }, { version: "desc" }],
    });

    return templates.map(mapPromptTemplate);
  }

  public async upsertPromptTemplate(input: {
    id?: string;
    name: string;
    code: string;
    description?: string;
    type: PromptTemplate["type"];
    version?: number;
    status: PromptTemplate["status"];
    templateText: string;
    responseSchema?: Record<string, unknown>;
    config?: Record<string, unknown>;
  }): Promise<PromptTemplate> {
    const template = input.id
      ? await this.prisma.promptTemplate.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            code: input.code,
            description: input.description,
            type: input.type,
            version: input.version,
            status: input.status,
            templateText: input.templateText,
            responseSchema: input.responseSchema as Prisma.InputJsonValue,
            config: input.config as Prisma.InputJsonValue,
          },
        })
      : await this.prisma.promptTemplate.create({
          data: {
            name: input.name,
            code: input.code,
            description: input.description,
            type: input.type,
            version: input.version ?? 1,
            status: input.status,
            templateText: input.templateText,
            responseSchema: input.responseSchema as Prisma.InputJsonValue,
            config: input.config as Prisma.InputJsonValue,
          },
        });

    return mapPromptTemplate(template);
  }

  public async listPlans(): Promise<SubscriptionPlan[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: [{ monthlyPriceCents: "asc" }, { includedCredits: "asc" }],
    });

    return plans.map(mapPlan);
  }

  public async upsertPlan(input: PlanUpsertInput): Promise<SubscriptionPlan> {
    const plan = input.id
      ? await this.prisma.subscriptionPlan.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            code: input.code,
            description: input.description,
            billingModel: input.billingModel,
            monthlyPriceCents: input.monthlyPriceCents,
            includedCredits: input.includedCredits,
            status: input.status,
          },
        })
      : await this.prisma.subscriptionPlan.create({
          data: {
            name: input.name,
            code: input.code,
            description: input.description,
            billingModel: input.billingModel,
            monthlyPriceCents: input.monthlyPriceCents,
            includedCredits: input.includedCredits,
            status: input.status,
          },
        });

    return mapPlan(plan);
  }

  public async listUsersUsage(): Promise<AdminUsageUserSummary[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        creditWallet: true,
        aiUsageLogs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map(
      (user: {
        id: string;
        email: string;
        fullName: string;
        role: "USER" | "ADMIN";
        creditWallet: { balance: number } | null;
        aiUsageLogs: Array<{
          technicalTotalTokens: number;
          billedCredits: number;
        }>;
      }) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletBalance: user.creditWallet?.balance ?? 0,
        totalTechnicalTokens: user.aiUsageLogs.reduce(
          (total: number, usage: { technicalTotalTokens: number }) =>
            total + usage.technicalTotalTokens,
          0,
        ),
        totalBilledCredits: user.aiUsageLogs.reduce(
          (total: number, usage: { billedCredits: number }) =>
            total + usage.billedCredits,
          0,
        ),
      }),
    );
  }
}
