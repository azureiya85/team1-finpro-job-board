/*
  Warnings:

  - The values [PHONE,IN_PERSON] on the enum `InterviewType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InterviewType_new" AS ENUM ('ONLINE', 'ONSITE');
ALTER TABLE "interview_schedules" ALTER COLUMN "interviewType" DROP DEFAULT;
ALTER TABLE "interview_schedules" ALTER COLUMN "interviewType" TYPE "InterviewType_new" USING ("interviewType"::text::"InterviewType_new");
ALTER TYPE "InterviewType" RENAME TO "InterviewType_old";
ALTER TYPE "InterviewType_new" RENAME TO "InterviewType";
DROP TYPE "InterviewType_old";
ALTER TABLE "interview_schedules" ALTER COLUMN "interviewType" SET DEFAULT 'ONLINE';
COMMIT;
