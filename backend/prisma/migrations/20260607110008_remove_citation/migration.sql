/*
  Warnings:

  - You are about to drop the `BookCitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Citation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JournalCitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportCitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WebsiteCitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BookCitation" DROP CONSTRAINT "BookCitation_citationId_fkey";

-- DropForeignKey
ALTER TABLE "Citation" DROP CONSTRAINT "Citation_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Citation" DROP CONSTRAINT "Citation_userId_fkey";

-- DropForeignKey
ALTER TABLE "JournalCitation" DROP CONSTRAINT "JournalCitation_citationId_fkey";

-- DropForeignKey
ALTER TABLE "ReportCitation" DROP CONSTRAINT "ReportCitation_citationId_fkey";

-- DropForeignKey
ALTER TABLE "WebsiteCitation" DROP CONSTRAINT "WebsiteCitation_citationId_fkey";

-- DropTable
DROP TABLE "BookCitation";

-- DropTable
DROP TABLE "Citation";

-- DropTable
DROP TABLE "JournalCitation";

-- DropTable
DROP TABLE "ReportCitation";

-- DropTable
DROP TABLE "WebsiteCitation";
