/*
  Warnings:

  - A unique constraint covering the columns `[paraphraseRunId]` on the table `AiUsageLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "paraphraseRunStatuses" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "CreditTransactionSource" ADD VALUE 'AI_PARAPHRASE';

-- AlterEnum
ALTER TYPE "PromptTemplateType" ADD VALUE 'SECTION_PARAPHRASE';

-- AlterTable
ALTER TABLE "AiUsageLog" ADD COLUMN     "paraphraseRunId" TEXT;

-- AlterTable
ALTER TABLE "CreditTransaction" ADD COLUMN     "relatedParaphraseRunId" TEXT;

-- CreateTable
CREATE TABLE "ParaphraseRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "paraphrasedText" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "preservedWords" JSONB,
    "lengthStrategy" TEXT,
    "changes" JSONB,
    "metrics" JSONB,
    "aiProvider" "AiProvider" NOT NULL DEFAULT 'OPENAI',
    "grammarTips" JSONB,
    "status" "paraphraseRunStatuses" NOT NULL DEFAULT 'QUEUED',
    "aiModel" TEXT NOT NULL,
    "promptTemplateId" TEXT,
    "rawResponse" JSONB,
    "errorMessage" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "appCreditsConsumed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParaphraseRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParaphraseRun_projectId_createdAt_idx" ON "ParaphraseRun"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ParaphraseRun_sectionId_createdAt_idx" ON "ParaphraseRun"("sectionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiUsageLog_paraphraseRunId_key" ON "AiUsageLog"("paraphraseRunId");

-- CreateIndex
CREATE INDEX "CreditTransaction_relatedParaphraseRunId_idx" ON "CreditTransaction"("relatedParaphraseRunId");

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_relatedParaphraseRunId_fkey" FOREIGN KEY ("relatedParaphraseRunId") REFERENCES "ParaphraseRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageLog" ADD CONSTRAINT "AiUsageLog_paraphraseRunId_fkey" FOREIGN KEY ("paraphraseRunId") REFERENCES "ParaphraseRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParaphraseRun" ADD CONSTRAINT "ParaphraseRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParaphraseRun" ADD CONSTRAINT "ParaphraseRun_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ProjectSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParaphraseRun" ADD CONSTRAINT "ParaphraseRun_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParaphraseRun" ADD CONSTRAINT "ParaphraseRun_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "PromptTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
