-- CreateEnum
CREATE TYPE "GuideLineType" AS ENUM ('PARAPHRASE', 'REVIEW');

-- AlterTable
ALTER TABLE "GuidelinePack" ADD COLUMN     "type" "GuideLineType" NOT NULL DEFAULT 'REVIEW';

-- AlterTable
ALTER TABLE "ParaphraseRun" ADD COLUMN     "guidelinePackId" TEXT;

-- AddForeignKey
ALTER TABLE "ParaphraseRun" ADD CONSTRAINT "ParaphraseRun_guidelinePackId_fkey" FOREIGN KEY ("guidelinePackId") REFERENCES "GuidelinePack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
