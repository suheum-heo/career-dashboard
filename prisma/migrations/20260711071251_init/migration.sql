-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('WISHLIST', 'APPLIED', 'OA', 'RECRUITER_SCREEN', 'INTERVIEW', 'FINAL_ROUND', 'OFFER', 'REJECTED', 'WITHDRAWN', 'GHOSTED');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "location" TEXT,
    "dateApplied" TIMESTAMP(3),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'WISHLIST',
    "salary" TEXT,
    "referral" BOOLEAN NOT NULL DEFAULT false,
    "jobLink" TEXT,
    "resumeVersion" TEXT,
    "coverLetter" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "interviewDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_dateApplied_idx" ON "Application"("dateApplied");

-- CreateIndex
CREATE INDEX "Application_company_idx" ON "Application"("company");

-- CreateIndex
CREATE INDEX "Application_location_idx" ON "Application"("location");

-- CreateIndex
CREATE INDEX "Application_interviewDate_idx" ON "Application"("interviewDate");
