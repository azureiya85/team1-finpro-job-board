/*
  Warnings:

  - A unique constraint covering the columns `[testResultId]` on the table `job_applications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "job_applications_testResultId_key" ON "job_applications"("testResultId");
