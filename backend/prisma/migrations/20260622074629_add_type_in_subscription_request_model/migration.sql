/*
  Warnings:

  - Added the required column `type` to the `SubscriptionRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionRequestType" AS ENUM ('PURCHASE', 'UPGRADE');

-- AlterEnum
ALTER TYPE "UserSubscriptionStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "SubscriptionRequest" ADD COLUMN     "type" "SubscriptionRequestType" NOT NULL;

-- DropEnum
DROP TYPE "CitationType";
