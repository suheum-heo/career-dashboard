-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('INTERNSHIP', 'FULL_TIME');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'INTERNSHIP',
ADD COLUMN     "startYear" INTEGER;

-- CreateIndex
CREATE INDEX "Application_jobType_idx" ON "Application"("jobType");

-- CreateIndex
CREATE INDEX "Application_startYear_idx" ON "Application"("startYear");
