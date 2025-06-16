/*
  Warnings:

  - You are about to drop the column `jobId` on the `pre_selection_tests` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "pre_selection_tests" DROP CONSTRAINT "pre_selection_tests_jobId_fkey";

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "preSelectionTestId" TEXT;

-- AlterTable
ALTER TABLE "pre_selection_tests" DROP COLUMN "jobId";

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_preSelectionTestId_fkey" FOREIGN KEY ("preSelectionTestId") REFERENCES "pre_selection_tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
