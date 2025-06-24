/*
  Warnings:

  - A unique constraint covering the columns `[workExperienceId]` on the table `company_reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('PAYSLIP', 'CONTRACT', 'COMPANY_EMAIL', 'ADMIN_MANUAL');

-- AlterTable
ALTER TABLE "company_reviews" ADD COLUMN     "workExperienceId" TEXT;

-- CreateTable
CREATE TABLE "work_experiences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "employmentStatus" "EmploymentStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" "VerificationMethod",
    "verificationProof" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_experiences_userId_companyId_key" ON "work_experiences"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_reviews_workExperienceId_key" ON "company_reviews"("workExperienceId");

-- AddForeignKey
ALTER TABLE "company_reviews" ADD CONSTRAINT "company_reviews_workExperienceId_fkey" FOREIGN KEY ("workExperienceId") REFERENCES "work_experiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
