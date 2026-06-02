/*
  Warnings:

  - A unique constraint covering the columns `[userId,status]` on the table `UserSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserSubscriptionStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "UserSubscription" ALTER COLUMN "currentPeriodStart" DROP NOT NULL,
ALTER COLUMN "currentPeriodEnd" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_status_key" ON "UserSubscription"("userId", "status");
