/*
  Warnings:

  - You are about to drop the column `preSelectionTestId` on the `job_postings` table. All the data in the column will be lost.
  - Added the required column `jobId` to the `pre_selection_tests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "job_postings" DROP CONSTRAINT "job_postings_preSelectionTestId_fkey";

-- AlterTable
ALTER TABLE "job_postings" DROP COLUMN "preSelectionTestId";

-- AlterTable
ALTER TABLE "pre_selection_tests" ADD COLUMN     "jobId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "pre_selection_tests" ADD CONSTRAINT "pre_selection_tests_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
