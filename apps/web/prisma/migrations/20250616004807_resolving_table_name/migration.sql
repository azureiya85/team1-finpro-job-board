/*
  Warnings:

  - You are about to drop the `test_results` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "test_results" DROP CONSTRAINT "test_results_testId_fkey";

-- DropForeignKey
ALTER TABLE "test_results" DROP CONSTRAINT "test_results_userId_fkey";

-- DropTable
DROP TABLE "test_results";
