/*
  Warnings:

  - You are about to drop the column `testCompletedAt` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `testScore` on the `job_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job_applications" DROP COLUMN "testCompletedAt",
DROP COLUMN "testId",
DROP COLUMN "testScore",
ADD COLUMN     "testResultId" TEXT;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_testResultId_fkey" FOREIGN KEY ("testResultId") REFERENCES "test_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;
