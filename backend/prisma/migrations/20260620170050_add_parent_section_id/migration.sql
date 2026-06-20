/*
  Warnings:

  - You are about to drop the column `code` on the `journals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `GuidelinePack` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `maxChars` to the `ProjectSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxChars` to the `journal_section_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialtyId` to the `journals` table without a default value. This is not possible if the table is not empty.
  - Made the column `guidelinePackId` on table `journals` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "GuidelinePack_code_key";

-- DropIndex
DROP INDEX "journals_code_key";

-- AlterTable
ALTER TABLE "GuidelinePack" ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectSection" ADD COLUMN     "maxChars" INTEGER NOT NULL,
ADD COLUMN     "parentSectionId" TEXT;

-- AlterTable
ALTER TABLE "journal_section_templates" ADD COLUMN     "maxChars" INTEGER NOT NULL,
ADD COLUMN     "parentSectionId" TEXT;

-- AlterTable
ALTER TABLE "journals" DROP COLUMN "code",
ADD COLUMN     "specialtyId" TEXT NOT NULL,
ALTER COLUMN "guidelinePackId" SET NOT NULL;

-- DropEnum
DROP TYPE "CitationType";

-- CreateTable
CREATE TABLE "JournalSpecialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalSpecialty_name_key" ON "JournalSpecialty"("name");

-- CreateIndex
CREATE INDEX "JournalSpecialty_name_idx" ON "JournalSpecialty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GuidelinePack_name_key" ON "GuidelinePack"("name");

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "JournalSpecialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_section_templates" ADD CONSTRAINT "journal_section_templates_parentSectionId_fkey" FOREIGN KEY ("parentSectionId") REFERENCES "journal_section_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSection" ADD CONSTRAINT "ProjectSection_parentSectionId_fkey" FOREIGN KEY ("parentSectionId") REFERENCES "ProjectSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
