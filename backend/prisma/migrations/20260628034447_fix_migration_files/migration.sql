/*
  Warnings:

  - You are about to drop the column `description` on the `journal_section_templates` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "SubscriptionRequestStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "ProjectSection" ADD COLUMN     "parentSectionId" TEXT;

-- AlterTable
ALTER TABLE "journal_section_templates" DROP COLUMN "description",
ADD COLUMN     "parentSectionId" TEXT,
ADD COLUMN     "sectionPrompt" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "journal_section_templates" ADD CONSTRAINT "journal_section_templates_parentSectionId_fkey" FOREIGN KEY ("parentSectionId") REFERENCES "journal_section_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSection" ADD CONSTRAINT "ProjectSection_parentSectionId_fkey" FOREIGN KEY ("parentSectionId") REFERENCES "ProjectSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
