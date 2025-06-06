-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobCategory" ADD VALUE 'ENGINEERING';
ALTER TYPE "JobCategory" ADD VALUE 'SCIENCE_RESEARCH';
ALTER TYPE "JobCategory" ADD VALUE 'ARTS_ENTERTAINMENT';
ALTER TYPE "JobCategory" ADD VALUE 'WRITING_EDITING';
ALTER TYPE "JobCategory" ADD VALUE 'AGRICULTURE';
ALTER TYPE "JobCategory" ADD VALUE 'REAL_ESTATE';
ALTER TYPE "JobCategory" ADD VALUE 'AUTOMOTIVE';
ALTER TYPE "JobCategory" ADD VALUE 'AEROSPACE_DEFENSE';
ALTER TYPE "JobCategory" ADD VALUE 'ENERGY_UTILITIES';
ALTER TYPE "JobCategory" ADD VALUE 'TELECOMMUNICATIONS';
ALTER TYPE "JobCategory" ADD VALUE 'LOGISTICS_SUPPLY_CHAIN';
ALTER TYPE "JobCategory" ADD VALUE 'ARCHITECTURE_PLANNING';
ALTER TYPE "JobCategory" ADD VALUE 'SPORTS_FITNESS';
ALTER TYPE "JobCategory" ADD VALUE 'ENVIRONMENTAL_SERVICES';
ALTER TYPE "JobCategory" ADD VALUE 'SECURITY_PROTECTIVE_SERVICES';
