import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { env } from "../src/shared/config/env";
import { ELSEVIER_SCARE_JOURNAL } from "../src/shared/seed-data/journals";
import { ARTICLE_TYPES, SPECIALTIES } from "src/shared/seed-data/constants.js";

// TODO: Replace these with the Luna and Sol model real IDs
const LUNA_MODEL_ID = env.LUNA_MODEL_ID;
const SOL_MODEL_ID = env.SOL_MODEL_ID;

const j = ELSEVIER_SCARE_JOURNAL;

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
      isVerified: true,
    },
    create: {
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: input.role,
      isActive: true,
      isVerified: true,
    },
  });
}

async function main() {
  const [freePlan, basicPlan, lunaPlan, solPlan] = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { name: "Free" },
      update: {
        name: "Free",
        description: "Free plan with a weekly token limit.",
        billingModel: "FREE",
        monthlyPriceCents: 0,
        status: "ACTIVE",
        aiProvider: "GROQ",
        aiModel: "openai/gpt-oss-120b",
        tokenLimit: 100000,
        includedCredits: 100000,
        limitPeriod: "WEEKLY",
      },
      create: {
        name: "Free",
        code: "free",
        description: "Free plan with a weekly token limit.",
        billingModel: "FREE",
        monthlyPriceCents: 0,
        status: "ACTIVE",
        aiProvider: "GROQ",
        aiModel: "openai/gpt-oss-120b",
        tokenLimit: 100000,
        includedCredits: 100000,
        limitPeriod: "WEEKLY",
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { name: "Basic" },
      update: {
        name: "Basic",
        description: "Basic plan with 1M tokens per month.",
        billingModel: "MONTHLY",
        monthlyPriceCents: 499,
        status: "ACTIVE",
        aiProvider: "GROQ",
        aiModel: "openai/gpt-oss-120b",
        tokenLimit: 1000000,
        includedCredits: 1000000,
        limitPeriod: "MONTHLY",
      },
      create: {
        name: "Basic",
        code: "basic",
        description: "Basic plan with 1M tokens per month.",
        billingModel: "MONTHLY",
        monthlyPriceCents: 499,
        status: "ACTIVE",
        aiProvider: "GROQ",
        aiModel: "openai/gpt-oss-120b",
        tokenLimit: 1000000,
        includedCredits: 1000000,
        limitPeriod: "MONTHLY",
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { name: "Luna" },
      update: {
        name: "Luna",
        description: "Luna plan with a better AI model.",
        billingModel: "MONTHLY",
        monthlyPriceCents: 999,
        status: "ACTIVE",
        aiProvider: "OPENROUTER",
        aiModel: LUNA_MODEL_ID,
        tokenLimit: 1000000,
        includedCredits: 1000000,
        limitPeriod: "MONTHLY",
      },
      create: {
        name: "Luna",
        code: "luna",
        description: "Luna plan with a better AI model.",
        billingModel: "MONTHLY",
        monthlyPriceCents: 999,
        status: "ACTIVE",
        aiProvider: "OPENROUTER",
        aiModel: LUNA_MODEL_ID,
        tokenLimit: 1000000,
        includedCredits: 1000000,
        limitPeriod: "MONTHLY",
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { name: "Sol" },
      update: {
        name: "Sol",
        description: "Sol plan with our strongest AI model.",
        billingModel: "MONTHLY",
        monthlyPriceCents: 1999,
        status: "ACTIVE",
        aiProvider: "OPENROUTER",
        aiModel: SOL_MODEL_ID,
        tokenLimit: 1000000,
        includedCredits: 1000000,
        limitPeriod: "MONTHLY",
      },
      create: {
        name: "Sol",
        code: "sol",
        description: "Sol plan with our strongest AI model.",
        billingModel: "MONTHLY",
        monthlyPriceCents: 1999,
        status: "ACTIVE",
        aiProvider: "OPENROUTER",
        aiModel: SOL_MODEL_ID,
        tokenLimit: 1000000,
        includedCredits: 1000000,
        limitPeriod: "MONTHLY",
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
      subscriptionPlanId: basicPlan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      autoRenew: true,
    },
  });

  const guidelinePack = await prisma.guidelinePack.upsert({
    where: { name: "CARE-like Case Report Guidance" },
    update: {
      type: "REVIEW",
      name: "CARE-like Case Report Guidance",
      version: "1.0.0",
      description: "Baseline case report completeness and safety rules.",
      status: "ACTIVE",
      rules: { text: j.guidelinePack },
      isDefault: true,
    },
    create: {
      type: "REVIEW",
      name: "CARE-like Case Report Guidance",
      version: "1.0.0",
      description: "Baseline case report completeness and safety rules.",
      status: "ACTIVE",
      rules: { text: j.guidelinePack },
      isDefault: true,
    },
  });

  await prisma.guidelinePack.upsert({
    where: { name: "Paraphrasing Guidance" },
    update: {
      type: "PARAPHRASE",
      name: "Paraphrasing Guidance",
      version: "1.0.0",
      description: "Rules for safe and accurate paraphrasing.",
      status: "ACTIVE",
      rules: {
        mustCheck: [
          "Preserve original meaning",
          "Do not add new information",
          "Avoid plagiarism",
          "Maintain academic tone",
          "Improve clarity",
        ],
      },
      isDefault: true,
    },
    create: {
      type: "PARAPHRASE",
      name: "Paraphrasing Guidance",
      code: "section-paraphrase-v1",
      version: "1.0.0",
      description: "Rules for safe and accurate paraphrasing.",
      status: "ACTIVE",
      rules: {
        mustCheck: [
          "Preserve original meaning",
          "Do not add new information",
          "Avoid plagiarism",
          "Maintain academic tone",
          "Improve clarity",
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

  const paraphrasePromptTemplate = await prisma.promptTemplate.upsert({
    where: { code: "case_report_section_paraphrase" },
    update: {
      name: "Case Report Section Paraphrase",
      type: "SECTION_PARAPHRASE",
      version: 1,
      status: "ACTIVE",
      templateText: [
        `You are an expert publication mentor for medical case reports.
        Task:
        Paraphrase the text.
        Rules:
        - Preserve meaning
        - Do not add new facts
        - Do not hallucinate
        - Tone: {{tone}}
        Text:
        """{{content}}"""
        `,
      ].join("\n"),
      responseSchema: {
        schemaVersion: 1,
      },
    },
    create: {
      name: "Case Report Section Paraphrase",
      code: "case_report_section_paraphrase",
      type: "SECTION_PARAPHRASE",
      version: 1,
      status: "ACTIVE",
      templateText: [
        `You are an expert publication mentor for medical case reports.
        Task:
        Paraphrase the text.
        Rules:
        - Preserve meaning
        - Do not add new facts
        - Do not hallucinate
        - Tone: {{tone}}
        Text:
        """{{content}}"""
        `,
      ].join("\n"),
      responseSchema: {
        schemaVersion: 1,
      },
    },
  });

  // Create journal specialties
  await Promise.all(
    SPECIALTIES.map((name) =>
      prisma.journalSpecialty.upsert({
        where: { name: name! },
        update: {},
        create: { name: name! },
      }),
    ),
  );

  const specialty = await prisma.journalSpecialty.findUnique({
    where: { name: SPECIALTIES[0] },
  });

  // Create Article Types
  await prisma.articleType.deleteMany();
  await prisma.articleType.createMany({
    data: ARTICLE_TYPES.map((articleType) => ({
      name: articleType.name,
      description: articleType.description,
      status: articleType.status,
    })),
  });

  const activeArticleType = await prisma.articleType.findFirst({
    where: { status: "ACTIVE" },
  });

  //  create journal
  const journal = await prisma.journal.upsert({
    where: { name: j.name },
    update: {
      name: j.name,
      publisher: j.publisher,
      description: j.description,
      isDefault: j.isDefault,
      guidelinePack: {
        connect: { id: guidelinePack.id },
      },
    },
    create: {
      name: j.name,
      publisher: j.publisher,
      description: j.description,
      isDefault: j.isDefault,
      guidelinePack: {
        connect: { id: guidelinePack.id },
      },
      specialty: {
        connect: { id: specialty?.id },
      },
      articleType: {
        connect: { id: activeArticleType?.id },
      },
    },
  });

  //  delete old templates
  await prisma.journalSectionTemplate.deleteMany({
    where: { journalId: journal.id },
  });

  // create sections
  for (const section of j.sections) {
    const createdSection = await prisma.journalSectionTemplate.create({
      data: {
        journalId: journal.id,
        key: section.title.toUpperCase(),
        title: section.title,
        sectionOrder: section.sectionOrder,
        isOptional: section.isOptional,
        sectionPrompt: section.sectionPrompt,
        maxWords: section.maxWords,
      },
    });

    if (section.checklists?.length) {
      await prisma.sectionChecklist.createMany({
        data: section.checklists.map((group) => ({
          journalSectionTemplateId: createdSection.id,
          title: group.title,
          items: group.items,
        })),
      });
    }

    if (section.subsections?.length) {
      for (const sub of section.subsections) {
        const createdSub = await prisma.journalSectionTemplate.create({
          data: {
            journalId: journal.id,
            parentSectionId: createdSection.id,
            key: sub.title.toUpperCase(),
            title: sub.title,
            sectionOrder: sub.sectionOrder,
            isOptional: sub.isOptional,
            sectionPrompt: sub.sectionPrompt,
            maxWords: sub.maxWords,
          },
        });

        if (sub.checklists?.length) {
          await prisma.sectionChecklist.createMany({
            data: sub.checklists.map((group) => ({
              journalSectionTemplateId: createdSub.id,
              title: group.title,
              items: group.items,
            })),
          });
        }
      }
    }
  }

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
        targetJournal: journal.name,
        journalId: journal.id,
        articleTypeId: activeArticleType?.id as string,
        specialtyId: specialty!.id,
        status: "IN_REVIEW",
      },
    }));

  const existingSections = await prisma.projectSection.findMany({
    where: {
      projectId: project.id,
    },
  });

  if (existingSections.length === 0) {
    const templates = await prisma.journalSectionTemplate.findMany({
      where: { journalId: journal.id },
      orderBy: { sectionOrder: "asc" },
    });

    if (templates.length === 0) {
      throw new Error(
        `Default journal '${journal.name}' has no section templates after seed.`,
      );
    }

    await prisma.projectSection.createMany({
      data: templates.map((t) => ({
        projectId: project.id,
        key: t.key,
        title: t.title,
        sectionOrder: t.sectionOrder,
        isOptional: t.isOptional,
        maxWords: t.maxWords,
      })),
    });
  }

  const sections = await prisma.projectSection.findMany({
    where: {
      projectId: project.id,
    },
  });

  const seededSectionContent: Record<string, string> = {
    TITLE: "A rare neurovascular presentation after delayed diagnosis",
    ABSTRACT:
      "This case report describes a rare neurovascular presentation with delayed diagnosis, highlighting key diagnostic reasoning and care lessons.",
    INTRODUCTION:
      "Rare neurovascular presentations can be difficult to recognize early, especially when symptoms overlap with more common benign conditions.",
    DISCUSSION:
      "The discussion outlines diagnostic complexity but still needs clearer comparison with related published cases and stronger explanation of novelty.",
    INFORMED_CONSENT:
      "Written informed consent for publication was obtained from the patient.",
  };

  for (const section of sections) {
    const content = seededSectionContent[section.key] ?? "";
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
    (section) => section.key === "DISCUSSION",
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
          guidelinePackId: journal.guidelinePackId,
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
        entityId: basicPlan.id,
        action: "SEED_UPSERT",
        metadata: { source: "seed" },
      },
      {
        actorUserId: admin.id,
        entityType: "guidelinePack",
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
        entityId: lunaPlan.id,
        action: "SEED_UPSERT",
        metadata: { source: "seed" },
      },
      {
        actorUserId: admin.id,
        entityType: "SubscriptionPlan",
        entityId: solPlan.id,
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
