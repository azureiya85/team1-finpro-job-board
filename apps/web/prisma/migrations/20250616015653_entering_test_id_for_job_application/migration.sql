/*
  Warnings:

  - A unique constraint covering the columns `[userId,jobPostingId,testId]` on the table `job_applications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `testId` to the `job_applications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "job_applications_userId_jobPostingId_key";

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "testId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_userId_jobPostingId_testId_key" ON "job_applications"("userId", "jobPostingId", "testId");
