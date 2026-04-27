import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { CASE_REPORT_SECTION_DEFINITIONS } from "../src/shared/constants/sections";
import { env } from "../src/shared/config/env";
import type { ProjectSectionKey } from "../src/modules/projects/domain/project";

const prisma = new PrismaClient();

async function upsertUser(input: {
  email: string;
  fullName: string;
  password: string;
  role: "USER" | "ADMIN";
}) {
  const passwordHash = await argon2.hash(input.password);

  return prisma.user.upsert({
    where: {
      email: input.email,
    },
    update: {
      fullName: input.fullName,
      passwordHash,
      role: input.role,
      isActive: true,
      deletedAt: null,
    },
    create: {
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: input.role,
      isActive: true,
    },
  });
}

async function main() {
  const [freePlan, standardPlan, premiumPlan, creditPackPlan] =
    await Promise.all([
      prisma.subscriptionPlan.upsert({
        where: { code: "free" },
        update: {
          name: "Free",
          description: "Starter plan for local demos.",
          billingModel: "FREE",
          includedCredits: 5000,
          monthlyPriceCents: 0,
          status: "ACTIVE",
        },
        create: {
          name: "Free",
          code: "free",
          description: "Starter plan for local demos.",
          billingModel: "FREE",
          includedCredits: 5000,
          monthlyPriceCents: 0,
          status: "ACTIVE",
        },
      }),
      prisma.subscriptionPlan.upsert({
        where: { code: "standard-monthly" },
        update: {
          name: "Standard",
          description: "Monthly plan with moderate review usage.",
          billingModel: "MONTHLY",
          includedCredits: 30000,
          monthlyPriceCents: 4900,
          status: "ACTIVE",
        },
        create: {
          name: "Standard",
          code: "standard-monthly",
          description: "Monthly plan with moderate review usage.",
          billingModel: "MONTHLY",
          includedCredits: 30000,
          monthlyPriceCents: 4900,
          status: "ACTIVE",
        },
      }),
      prisma.subscriptionPlan.upsert({
        where: { code: "premium-monthly" },
        update: {
          name: "Premium",
          description: "Monthly plan for heavier AI review usage.",
          billingModel: "MONTHLY",
          includedCredits: 90000,
          monthlyPriceCents: 12900,
          status: "ACTIVE",
        },
        create: {
          name: "Premium",
          code: "premium-monthly",
          description: "Monthly plan for heavier AI review usage.",
          billingModel: "MONTHLY",
          includedCredits: 90000,
          monthlyPriceCents: 12900,
          status: "ACTIVE",
        },
      }),
      prisma.subscriptionPlan.upsert({
        where: { code: "credit-pack-500" },
        update: {
          name: "Credit Pack 500",
          description: "One-time credit pack for extra review demand.",
          billingModel: "CREDIT_PACK",
          includedCredits: 50000,
          monthlyPriceCents: 9900,
          status: "ACTIVE",
        },
        create: {
          name: "Credit Pack 500",
          code: "credit-pack-500",
          description: "One-time credit pack for extra review demand.",
          billingModel: "CREDIT_PACK",
          includedCredits: 50000,
          monthlyPriceCents: 9900,
          status: "ACTIVE",
        },
      }),
    ]);

  const admin = await upsertUser({
    email: env.DEFAULT_ADMIN_EMAIL,
    fullName: "AI Mentor Admin",
    password: env.DEFAULT_ADMIN_PASSWORD,
    role: "ADMIN",
  });

  const testUser = await upsertUser({
    email: "researcher@example.com",
    fullName: "Dr. Maya Researcher",
    password: "Research123!",
    role: "USER",
  });

  await prisma.creditWallet.upsert({
    where: { userId: admin.id },
    update: {
      balance: 1000000,
      lifetimeCreditsGranted: 1000000,
      lifetimeCreditsConsumed: 0,
    },
    create: {
      userId: admin.id,
      balance: 1000000,
      lifetimeCreditsGranted: 1000000,
      lifetimeCreditsConsumed: 0,
    },
  });

  await prisma.creditWallet.upsert({
    where: { userId: testUser.id },
    update: {
      balance: 27500,
      lifetimeCreditsGranted: 30000,
      lifetimeCreditsConsumed: 2500,
    },
    create: {
      userId: testUser.id,
      balance: 27500,
      lifetimeCreditsGranted: 30000,
      lifetimeCreditsConsumed: 2500,
    },
  });

  await prisma.userSubscription.deleteMany({
    where: {
      userId: testUser.id,
    },
  });

  await prisma.userSubscription.create({
    data: {
      userId: testUser.id,
      subscriptionPlanId: standardPlan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      autoRenew: true,
    },
  });

  const guidelinePack = await prisma.guidelinePack.upsert({
    where: { code: "care-case-report-v1" },
    update: {
      name: "CARE-like Case Report Guidance",
      version: "1.0.0",
      description: "Baseline case report completeness and safety rules.",
      status: "ACTIVE",
      rules: {
        mustCheck: [
          "Clear case novelty",
          "Complete patient timeline",
          "Informed consent statement",
          "No fabricated citations",
          "Explicit missing data warnings",
        ],
      },
      isDefault: true,
    },
    create: {
      name: "CARE-like Case Report Guidance",
      code: "care-case-report-v1",
      version: "1.0.0",
      description: "Baseline case report completeness and safety rules.",
      status: "ACTIVE",
      rules: {
        mustCheck: [
          "Clear case novelty",
          "Complete patient timeline",
          "Informed consent statement",
          "No fabricated citations",
          "Explicit missing data warnings",
        ],
      },
      isDefault: true,
    },
  });

  await prisma.guidelinePack.updateMany({
    where: {
      id: {
        not: guidelinePack.id,
      },
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  const promptTemplate = await prisma.promptTemplate.upsert({
    where: { code: "case-report-section-review" },
    update: {
      name: "Case Report Section Review",
      type: "SECTION_REVIEW",
      version: 1,
      status: "ACTIVE",
      templateText: [
        "You are an expert medical writing mentor for case report publication.",
        "Review exactly one manuscript section.",
        "Return structured feedback only.",
        "Never fabricate clinical facts, references, patient details, or outcomes.",
        "If a section is incomplete, explain the gap and ask precise missing-information questions.",
      ].join("\n"),
      responseSchema: {
        schemaVersion: 1,
      },
    },
    create: {
      name: "Case Report Section Review",
      code: "case-report-section-review",
      type: "SECTION_REVIEW",
      version: 1,
      status: "ACTIVE",
      templateText: [
        "You are an expert medical writing mentor for case report publication.",
        "Review exactly one manuscript section.",
        "Return structured feedback only.",
        "Never fabricate clinical facts, references, patient details, or outcomes.",
        "If a section is incomplete, explain the gap and ask precise missing-information questions.",
      ].join("\n"),
      responseSchema: {
        schemaVersion: 1,
      },
    },
  });

  const existingProject = await prisma.project.findFirst({
    where: {
      ownerId: testUser.id,
      title: "Seeded Case Report Demo",
      deletedAt: null,
    },
    include: {
      sections: true,
      reviewRuns: true,
    },
  });

  const project =
    existingProject ??
    (await prisma.project.create({
      data: {
        ownerId: testUser.id,
        title: "Seeded Case Report Demo",
        targetJournal: "BMJ Case Reports",
        status: "IN_REVIEW",
        metadata: {
          specialty: "Neurology",
          patientAge: "34 years",
          patientSex: "Female",
          country: "United States",
          institution: "Regional Academic Hospital",
          articleGoals:
            "Demonstrate a rare presentation and diagnostic learning points.",
        },
      },
    }));

  const existingSections = await prisma.projectSection.findMany({
    where: {
      projectId: project.id,
    },
  });

  if (existingSections.length === 0) {
    await prisma.projectSection.createMany({
      data: CASE_REPORT_SECTION_DEFINITIONS.map((section) => ({
        projectId: project.id,
        key: section.key,
        title: section.title,
        sectionOrder: section.order,
        isOptional: section.optional,
      })),
    });
  }

  const sections = await prisma.projectSection.findMany({
    where: {
      projectId: project.id,
    },
  });

  const seededSectionContent: Partial<Record<ProjectSectionKey, string>> = {
    TITLE: "A rare neurovascular presentation after delayed diagnosis",
    ABSTRACT:
      "This case report describes a rare neurovascular presentation with delayed diagnosis, highlighting key diagnostic reasoning and care lessons.",
    INTRODUCTION:
      "Rare neurovascular presentations can be difficult to recognize early, especially when symptoms overlap with more common benign conditions.",
    CASE_PRESENTATION:
      "A 34-year-old woman presented with intermittent neurologic symptoms over two weeks. Initial workup was incomplete and timeline details remain partially documented.",
    DISCUSSION:
      "The discussion outlines diagnostic complexity but still needs clearer comparison with related published cases and stronger explanation of novelty.",
    INFORMED_CONSENT:
      "Written informed consent for publication was obtained from the patient.",
  };

  for (const section of sections) {
    const content =
      seededSectionContent[section.key as ProjectSectionKey] ?? "";
    await prisma.projectSection.update({
      where: { id: section.id },
      data: {
        content,
        status: content ? "DRAFT" : "NOT_STARTED",
        lastEditedAt: content ? new Date() : null,
      },
    });

    if (content) {
      const existingVersion = await prisma.sectionVersion.findFirst({
        where: {
          sectionId: section.id,
        },
      });

      if (!existingVersion) {
        await prisma.sectionVersion.create({
          data: {
            sectionId: section.id,
            versionNumber: 1,
            content,
            changeSummary: "Seeded initial section content",
            editedById: testUser.id,
          },
        });
      }
    }
  }

  const discussionSection = sections.find(
    (section: { key: ProjectSectionKey }) => section.key === "DISCUSSION",
  );
  if (discussionSection) {
    const existingReview = await prisma.reviewRun.findFirst({
      where: {
        projectId: project.id,
        sectionId: discussionSection.id,
      },
    });

    if (!existingReview) {
      const reviewRun = await prisma.reviewRun.create({
        data: {
          projectId: project.id,
          sectionId: discussionSection.id,
          initiatedById: testUser.id,
          promptTemplateId: promptTemplate.id,
          guidelinePackId: guidelinePack.id,
          aiModel: "gpt-5-mini",
          status: "COMPLETED",
          summary:
            "The discussion identifies the diagnostic challenge but needs stronger literature context and a more explicit novelty statement.",
          nextSteps: [
            "Compare the case with 2-3 similar reports using verified references.",
            "Explain the educational value of the delayed diagnosis.",
            "Clarify why this case should be publishable beyond a routine presentation.",
          ],
          missingInfoQuestions: [
            "What exact timeline connects symptom onset, referral, imaging, and final diagnosis?",
            "Which prior case reports are most comparable and how does this case differ?",
          ],
          warnings: [
            "Do not add citations until they are verified from real sources.",
            "The current discussion may overstate novelty without evidence.",
          ],
          overallScore: 68,
          readinessIndicator: 64,
          inputTokens: 1810,
          outputTokens: 520,
          totalTokens: 2330,
          appCreditsConsumed: 2500,
          startedAt: new Date(),
          completedAt: new Date(),
          rawResponse: {
            seeded: true,
          },
          issues: {
            create: [
              {
                projectId: project.id,
                sectionId: discussionSection.id,
                severity: "HIGH",
                category: "Literature Context",
                title: "Novelty claim is not yet supported",
                description:
                  "The discussion implies novelty but does not compare the case against verified published reports.",
                reason:
                  "Editors will expect the discussion to explain what is new and why the case matters clinically.",
                fixSuggestion:
                  "Add a concise comparison with real literature and narrow any claim that cannot be supported.",
              },
              {
                projectId: project.id,
                sectionId: discussionSection.id,
                severity: "MEDIUM",
                category: "Clinical Reasoning",
                title: "Diagnostic timeline is vague",
                description:
                  "The discussion references delayed diagnosis without linking the delay to a clear sequence of events.",
                reason:
                  "Readers need a precise narrative to understand the practical learning point.",
                fixSuggestion:
                  "Summarize the key dates and decisions, then tie them to the final educational lesson.",
              },
            ],
          },
          suggestions: {
            create: [
              {
                type: "rewrite",
                title: "Strengthen novelty sentence",
                content:
                  "Consider rewriting the opening discussion sentence to emphasize what clinicians can learn rather than asserting unverified rarity.",
              },
            ],
          },
          metrics: {
            create: [
              {
                name: "completeness",
                score: 70,
                weight: 40,
                rationale:
                  "Core discussion present but lacking literature grounding.",
              },
              {
                name: "publication_risk",
                score: 58,
                weight: 30,
                rationale:
                  "Claims may be too strong until references are verified.",
              },
            ],
          },
        },
      });

      await prisma.aiUsageLog.create({
        data: {
          userId: testUser.id,
          projectId: project.id,
          reviewRunId: reviewRun.id,
          model: "gpt-5-mini",
          operation: "section_review",
          status: "SUCCESS",
          technicalInputTokens: 1810,
          technicalOutputTokens: 520,
          technicalTotalTokens: 2330,
          billedCredits: 2500,
        },
      });

      const wallet = await prisma.creditWallet.findUniqueOrThrow({
        where: { userId: testUser.id },
      });

      const existingTransaction = await prisma.creditTransaction.findFirst({
        where: {
          relatedReviewRunId: reviewRun.id,
        },
      });

      if (!existingTransaction) {
        await prisma.creditTransaction.create({
          data: {
            walletId: wallet.id,
            userId: testUser.id,
            type: "DEDUCTION",
            source: "AI_REVIEW",
            amount: -2500,
            balanceAfter: wallet.balance,
            relatedReviewRunId: reviewRun.id,
            description: "Seeded completed AI review",
          },
        });
      }
    }
  }

  await prisma.readinessSnapshot.deleteMany({
    where: {
      projectId: project.id,
    },
  });

  await prisma.readinessSnapshot.create({
    data: {
      projectId: project.id,
      overallScore: 64,
      status: "READY_FOR_INTERNAL_REVIEW",
      summary:
        "The manuscript has meaningful drafted content and one completed review, but it still needs literature validation and fuller section coverage.",
      blockers: [
        "Discussion: novelty needs verified literature support",
        "References section is still empty",
      ],
      strengths: [
        "Core narrative sections are drafted",
        "Consent statement exists",
        "AI review history is available for follow-up",
      ],
      sectionScores: {
        TITLE: 100,
        ABSTRACT: 100,
        INTRODUCTION: 100,
        CASE_PRESENTATION: 85,
        DISCUSSION: 75,
        INFORMED_CONSENT: 100,
        REFERENCES: 0,
      },
    },
  });

  await prisma.project.update({
    where: { id: project.id },
    data: {
      readinessScore: 64,
      lastReviewedAt: new Date(),
      status: "IN_REVIEW",
    },
  });

  await prisma.auditLog.deleteMany({
    where: {
      actorUserId: admin.id,
      action: "SEED_UPSERT",
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: admin.id,
        entityType: "SubscriptionPlan",
        entityId: standardPlan.id,
        action: "SEED_UPSERT",
        metadata: { source: "seed" },
      },
      {
        actorUserId: admin.id,
        entityType: "GuidelinePack",
        entityId: guidelinePack.id,
        action: "SEED_UPSERT",
        metadata: { source: "seed" },
      },
      {
        actorUserId: admin.id,
        entityType: "PromptTemplate",
        entityId: promptTemplate.id,
        action: "SEED_UPSERT",
        metadata: { source: "seed" },
      },
      {
        actorUserId: admin.id,
        entityType: "SubscriptionPlan",
        entityId: freePlan.id,
        action: "SEED_UPSERT",
        metadata: { source: "seed" },
      },
      {
        actorUserId: admin.id,
        entityType: "SubscriptionPlan",
        entityId: premiumPlan.id,
        action: "SEED_UPSERT",
        metadata: { source: "seed" },
      },
      {
        actorUserId: admin.id,
        entityType: "SubscriptionPlan",
        entityId: creditPackPlan.id,
        action: "SEED_UPSERT",
        metadata: { source: "seed" },
      },
    ],
  });

  console.log("Seed completed.");
  console.log(
    `Admin: ${env.DEFAULT_ADMIN_EMAIL} / ${env.DEFAULT_ADMIN_PASSWORD}`,
  );
  console.log("Researcher: researcher@example.com / Research123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
