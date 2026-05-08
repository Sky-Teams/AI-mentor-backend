/*
  Warnings:

  - You are about to drop the column `validationRules` on the `journals` table. All the data in the column will be lost.
  - You are about to drop the `JournalChecklistItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JournalChecklistItem" DROP CONSTRAINT "JournalChecklistItem_sectionId_fkey";

-- AlterTable
ALTER TABLE "journal_section_templates" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "journals" DROP COLUMN "validationRules",
ADD COLUMN     "guidelinePackId" TEXT;

-- DropTable
DROP TABLE "JournalChecklistItem";

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_guidelinePackId_fkey" FOREIGN KEY ("guidelinePackId") REFERENCES "GuidelinePack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
