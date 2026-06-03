/*
  Warnings:

  - The `type` column on the `GuidelinePack` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "GuidelineType" AS ENUM ('PARAPHRASE', 'REVIEW');

-- AlterTable
ALTER TABLE "GuidelinePack" DROP COLUMN "type",
ADD COLUMN     "type" "GuidelineType" NOT NULL DEFAULT 'REVIEW';

-- DropEnum
DROP TYPE "GuideLineType";

-- CreateTable
CREATE TABLE "journal_section_checklist_groups" (
    "id" TEXT NOT NULL,
    "journalSectionTemplateId" TEXT NOT NULL,
    "title" TEXT,
    "items" TEXT[],
    "completed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_section_checklist_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journal_section_checklist_groups_journalSectionTemplateId_idx" ON "journal_section_checklist_groups"("journalSectionTemplateId");

-- AddForeignKey
ALTER TABLE "journal_section_checklist_groups" ADD CONSTRAINT "journal_section_checklist_groups_journalSectionTemplateId_fkey" FOREIGN KEY ("journalSectionTemplateId") REFERENCES "journal_section_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
