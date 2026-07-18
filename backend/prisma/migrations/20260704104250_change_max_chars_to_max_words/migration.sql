/*
  Warnings:

  - You are about to drop the column `maxChars` on the `ProjectSection` table. All the data in the column will be lost.
  - You are about to drop the column `maxChars` on the `journal_section_templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectSection" DROP COLUMN "maxChars",
ADD COLUMN     "maxWords" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "journal_section_templates" DROP COLUMN "maxChars",
ADD COLUMN     "maxWords" INTEGER NOT NULL DEFAULT 5;
