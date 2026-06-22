/*
  Warnings:

  - You are about to drop the column `manuscriptType` on the `GuidelinePack` table. All the data in the column will be lost.
  - You are about to drop the column `manuscriptType` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `journals` table. All the data in the column will be lost.
  - You are about to drop the column `manuscriptType` on the `journals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `GuidelinePack` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `maxChars` to the `ProjectSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxChars` to the `journal_section_templates` table without a default value. This is not possible if the table is not empty.
  - Made the column `guidelinePackId` on table `journals` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ArticleTypesStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "GuidelinePack_code_key";

-- DropIndex
DROP INDEX "journals_code_key";

-- AlterTable
ALTER TABLE "GuidelinePack" DROP COLUMN "manuscriptType",
ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "manuscriptType",
ADD COLUMN     "articleTypeId" TEXT,
ADD COLUMN     "specialtyId" TEXT;

-- AlterTable
ALTER TABLE "ProjectSection" ADD COLUMN     "maxChars" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "journal_section_templates" ADD COLUMN     "maxChars" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "journals" DROP COLUMN "code",
DROP COLUMN "manuscriptType",
ADD COLUMN     "articleTypeId" TEXT,
ADD COLUMN     "specialtyId" TEXT,
ALTER COLUMN "guidelinePackId" SET NOT NULL;

-- DropEnum
DROP TYPE "ManuscriptType";

-- CreateTable
CREATE TABLE "JournalSpecialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ArticleTypesStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalSpecialty_name_key" ON "JournalSpecialty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleType_name_key" ON "ArticleType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GuidelinePack_name_key" ON "GuidelinePack"("name");

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "JournalSpecialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_articleTypeId_fkey" FOREIGN KEY ("articleTypeId") REFERENCES "ArticleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_articleTypeId_fkey" FOREIGN KEY ("articleTypeId") REFERENCES "ArticleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "JournalSpecialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
