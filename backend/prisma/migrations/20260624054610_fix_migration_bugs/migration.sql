-- AlterEnum
ALTER TYPE "SubscriptionRequestStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "ProjectSection" ADD COLUMN     "parentSectionId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "journal_section_templates" ADD COLUMN     "parentSectionId" TEXT;

-- DropEnum
DROP TYPE "CitationType";

-- AddForeignKey
ALTER TABLE "journal_section_templates" ADD CONSTRAINT "journal_section_templates_parentSectionId_fkey" FOREIGN KEY ("parentSectionId") REFERENCES "journal_section_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSection" ADD CONSTRAINT "ProjectSection_parentSectionId_fkey" FOREIGN KEY ("parentSectionId") REFERENCES "ProjectSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
