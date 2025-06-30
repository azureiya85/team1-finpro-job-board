-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "isRenewal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalSubscriptionId" TEXT;
