-- AlterTable
ALTER TABLE "user_skill_assessments" ADD COLUMN     "subscriptionId" TEXT;

-- AddForeignKey
ALTER TABLE "user_skill_assessments" ADD CONSTRAINT "user_skill_assessments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
