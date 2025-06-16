/*
  Warnings:

  - A unique constraint covering the columns `[userId,jobPostingId]` on the table `job_applications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "job_applications_userId_jobPostingId_testId_key";

-- AlterTable
ALTER TABLE "job_applications" ALTER COLUMN "testId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_userId_jobPostingId_key" ON "job_applications"("userId", "jobPostingId");
