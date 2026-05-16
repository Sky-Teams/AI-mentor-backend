-- CreateEnum
CREATE TYPE "CitationFormatType" AS ENUM ('APA', 'MLA');

-- AlterTable
ALTER TABLE "Citation" ADD COLUMN     "style" "CitationFormatType" NOT NULL DEFAULT 'APA';
