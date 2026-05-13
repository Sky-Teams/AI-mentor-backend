-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ManuscriptType" AS ENUM ('CASE_REPORT');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('NOT_STARTED', 'DRAFT', 'IN_REVIEW', 'READY');

-- CreateEnum
CREATE TYPE "ReviewRunStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('NOT_READY', 'NEEDS_ATTENTION', 'READY_FOR_INTERNAL_REVIEW', 'READY_FOR_SUBMISSION');

-- CreateEnum
CREATE TYPE "GuidelinePackStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PromptTemplateType" AS ENUM ('SECTION_REVIEW', 'SYSTEM_GUARDRAIL', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "PromptTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlanBillingModel" AS ENUM ('FREE', 'MONTHLY', 'CREDIT_PACK', 'HYBRID');

-- CreateEnum
CREATE TYPE "SubscriptionPlanStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UserSubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'TRIALING');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('ALLOCATION', 'DEDUCTION', 'ADJUSTMENT', 'EXPIRY', 'REFUND', 'PURCHASE');

-- CreateEnum
CREATE TYPE "CreditTransactionSource" AS ENUM ('SUBSCRIPTION', 'AI_REVIEW', 'ADMIN_ADJUSTMENT', 'PURCHASE', 'MANUAL');

-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('OPENAI');

-- CreateEnum
CREATE TYPE "AiUsageStatus" AS ENUM ('SUCCESS', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "journals" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT,
    "description" TEXT,
    "manuscriptType" "ManuscriptType" NOT NULL DEFAULT 'CASE_REPORT',
    "validationRules" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_section_templates" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sectionOrder" INTEGER NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_section_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalChecklistItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "JournalChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "manuscriptType" "ManuscriptType" NOT NULL DEFAULT 'CASE_REPORT',
    "title" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "targetJournal" TEXT,
    "metadata" JSONB,
    "readinessScore" INTEGER,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "journalId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSection" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "sectionOrder" INTEGER NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "status" "SectionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "lastEditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionVersion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changeSummary" TEXT,
    "editedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "promptTemplateId" TEXT,
    "guidelinePackId" TEXT,
    "aiProvider" "AiProvider" NOT NULL DEFAULT 'OPENAI',
    "aiModel" TEXT NOT NULL,
    "status" "ReviewRunStatus" NOT NULL DEFAULT 'QUEUED',
    "summary" TEXT,
    "nextSteps" JSONB,
    "missingInfoQuestions" JSONB,
    "warnings" JSONB,
    "overallScore" INTEGER,
    "readinessIndicator" INTEGER,
    "rawResponse" JSONB,
    "errorMessage" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "appCreditsConsumed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewIssue" (
    "id" TEXT NOT NULL,
    "reviewRunId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "fixSuggestion" TEXT NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSuggestion" (
    "id" TEXT NOT NULL,
    "reviewRunId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewMetric" (
    "id" TEXT NOT NULL,
    "reviewRunId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "weight" INTEGER,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessSnapshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "status" "ReadinessStatus" NOT NULL,
    "summary" TEXT NOT NULL,
    "blockers" JSONB,
    "strengths" JSONB,
    "sectionScores" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadinessSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidelinePack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "manuscriptType" "ManuscriptType" NOT NULL DEFAULT 'CASE_REPORT',
    "status" "GuidelinePackStatus" NOT NULL DEFAULT 'DRAFT',
    "rules" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "GuidelinePack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromptTemplateType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PromptTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "templateText" TEXT NOT NULL,
    "responseSchema" JSONB,
    "config" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "billingModel" "PlanBillingModel" NOT NULL,
    "monthlyPriceCents" INTEGER,
    "includedCredits" INTEGER NOT NULL DEFAULT 0,
    "overageCreditPriceCents" INTEGER,
    "features" JSONB,
    "status" "SubscriptionPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionPlanId" TEXT NOT NULL,
    "status" "UserSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "externalReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lifetimeCreditsGranted" INTEGER NOT NULL DEFAULT 0,
    "lifetimeCreditsConsumed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "source" "CreditTransactionSource" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT,
    "relatedReviewRunId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "reviewRunId" TEXT,
    "provider" "AiProvider" NOT NULL DEFAULT 'OPENAI',
    "model" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" "AiUsageStatus" NOT NULL,
    "technicalInputTokens" INTEGER NOT NULL DEFAULT 0,
    "technicalOutputTokens" INTEGER NOT NULL DEFAULT 0,
    "technicalTotalTokens" INTEGER NOT NULL DEFAULT 0,
    "billedCredits" INTEGER NOT NULL DEFAULT 0,
    "costEstimateUsd" DECIMAL(10,4),
    "latencyMs" INTEGER,
    "requestHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "journals_code_key" ON "journals"("code");

-- CreateIndex
CREATE UNIQUE INDEX "journals_name_key" ON "journals"("name");

-- CreateIndex
CREATE INDEX "journals_isDefault_idx" ON "journals"("isDefault");

-- CreateIndex
CREATE INDEX "journal_section_templates_journalId_sectionOrder_idx" ON "journal_section_templates"("journalId", "sectionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "journal_section_templates_journalId_key_key" ON "journal_section_templates"("journalId", "key");

-- CreateIndex
CREATE INDEX "JournalChecklistItem_sectionId_idx" ON "JournalChecklistItem"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Project_ownerId_updatedAt_idx" ON "Project"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_journalId_idx" ON "Project"("journalId");

-- CreateIndex
CREATE INDEX "ProjectSection_projectId_sectionOrder_idx" ON "ProjectSection"("projectId", "sectionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSection_projectId_key_key" ON "ProjectSection"("projectId", "key");

-- CreateIndex
CREATE INDEX "SectionVersion_editedById_createdAt_idx" ON "SectionVersion"("editedById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SectionVersion_sectionId_versionNumber_key" ON "SectionVersion"("sectionId", "versionNumber");

-- CreateIndex
CREATE INDEX "ReviewRun_projectId_createdAt_idx" ON "ReviewRun"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewRun_sectionId_createdAt_idx" ON "ReviewRun"("sectionId", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewRun_status_idx" ON "ReviewRun"("status");

-- CreateIndex
CREATE INDEX "ReviewIssue_projectId_status_severity_idx" ON "ReviewIssue"("projectId", "status", "severity");

-- CreateIndex
CREATE INDEX "ReviewIssue_sectionId_status_idx" ON "ReviewIssue"("sectionId", "status");

-- CreateIndex
CREATE INDEX "ReviewSuggestion_reviewRunId_idx" ON "ReviewSuggestion"("reviewRunId");

-- CreateIndex
CREATE INDEX "ReviewMetric_reviewRunId_idx" ON "ReviewMetric"("reviewRunId");

-- CreateIndex
CREATE INDEX "ReadinessSnapshot_projectId_createdAt_idx" ON "ReadinessSnapshot"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuidelinePack_code_key" ON "GuidelinePack"("code");

-- CreateIndex
CREATE INDEX "GuidelinePack_status_isDefault_idx" ON "GuidelinePack"("status", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_code_key" ON "PromptTemplate"("code");

-- CreateIndex
CREATE INDEX "PromptTemplate_type_status_idx" ON "PromptTemplate"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_code_key" ON "SubscriptionPlan"("code");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_status_billingModel_idx" ON "SubscriptionPlan"("status", "billingModel");

-- CreateIndex
CREATE INDEX "UserSubscription_userId_status_currentPeriodEnd_idx" ON "UserSubscription"("userId", "status", "currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "CreditWallet_userId_key" ON "CreditWallet"("userId");

-- CreateIndex
CREATE INDEX "CreditWallet_balance_idx" ON "CreditWallet"("balance");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_relatedReviewRunId_idx" ON "CreditTransaction"("relatedReviewRunId");

-- CreateIndex
CREATE UNIQUE INDEX "AiUsageLog_reviewRunId_key" ON "AiUsageLog"("reviewRunId");

-- CreateIndex
CREATE INDEX "AiUsageLog_userId_createdAt_idx" ON "AiUsageLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageLog_projectId_createdAt_idx" ON "AiUsageLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "journal_section_templates" ADD CONSTRAINT "journal_section_templates_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalChecklistItem" ADD CONSTRAINT "JournalChecklistItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "journal_section_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "journals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSection" ADD CONSTRAINT "ProjectSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionVersion" ADD CONSTRAINT "SectionVersion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ProjectSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionVersion" ADD CONSTRAINT "SectionVersion_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRun" ADD CONSTRAINT "ReviewRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRun" ADD CONSTRAINT "ReviewRun_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ProjectSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRun" ADD CONSTRAINT "ReviewRun_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRun" ADD CONSTRAINT "ReviewRun_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "PromptTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRun" ADD CONSTRAINT "ReviewRun_guidelinePackId_fkey" FOREIGN KEY ("guidelinePackId") REFERENCES "GuidelinePack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewIssue" ADD CONSTRAINT "ReviewIssue_reviewRunId_fkey" FOREIGN KEY ("reviewRunId") REFERENCES "ReviewRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewIssue" ADD CONSTRAINT "ReviewIssue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewIssue" ADD CONSTRAINT "ReviewIssue_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ProjectSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewIssue" ADD CONSTRAINT "ReviewIssue_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSuggestion" ADD CONSTRAINT "ReviewSuggestion_reviewRunId_fkey" FOREIGN KEY ("reviewRunId") REFERENCES "ReviewRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewMetric" ADD CONSTRAINT "ReviewMetric_reviewRunId_fkey" FOREIGN KEY ("reviewRunId") REFERENCES "ReviewRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessSnapshot" ADD CONSTRAINT "ReadinessSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditWallet" ADD CONSTRAINT "CreditWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "CreditWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_relatedReviewRunId_fkey" FOREIGN KEY ("relatedReviewRunId") REFERENCES "ReviewRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageLog" ADD CONSTRAINT "AiUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageLog" ADD CONSTRAINT "AiUsageLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageLog" ADD CONSTRAINT "AiUsageLog_reviewRunId_fkey" FOREIGN KEY ("reviewRunId") REFERENCES "ReviewRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
