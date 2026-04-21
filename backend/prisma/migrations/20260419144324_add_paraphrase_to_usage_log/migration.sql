/*
  Warnings:

  - You are about to drop the column `paraphraseRunId` on the `CreditTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paraphraseRunId]` on the table `AiUsageLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "CreditTransactionSource" ADD VALUE 'AI_PARAPHRASE';

-- DropForeignKey
ALTER TABLE "CreditTransaction" DROP CONSTRAINT "CreditTransaction_paraphraseRunId_fkey";

-- AlterTable
ALTER TABLE "AiUsageLog" ADD COLUMN     "paraphraseRunId" TEXT;

-- AlterTable
ALTER TABLE "CreditTransaction" DROP COLUMN "paraphraseRunId",
ADD COLUMN     "relatedParaphraseRunId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AiUsageLog_paraphraseRunId_key" ON "AiUsageLog"("paraphraseRunId");

-- CreateIndex
CREATE INDEX "CreditTransaction_relatedParaphraseRunId_idx" ON "CreditTransaction"("relatedParaphraseRunId");

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_relatedParaphraseRunId_fkey" FOREIGN KEY ("relatedParaphraseRunId") REFERENCES "ParaphraseRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsageLog" ADD CONSTRAINT "AiUsageLog_paraphraseRunId_fkey" FOREIGN KEY ("paraphraseRunId") REFERENCES "ParaphraseRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
