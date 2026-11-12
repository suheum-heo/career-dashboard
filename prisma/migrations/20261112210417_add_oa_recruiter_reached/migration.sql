-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "oaReached" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Application" ADD COLUMN     "recruiterReached" BOOLEAN NOT NULL DEFAULT false;

-- Backfill from current pipeline status
UPDATE "Application"
SET "oaReached" = true
WHERE status IN ('OA', 'RECRUITER_SCREEN', 'INTERVIEW', 'FINAL_ROUND', 'OFFER');

UPDATE "Application"
SET "recruiterReached" = true
WHERE status IN ('RECRUITER_SCREEN', 'INTERVIEW', 'FINAL_ROUND', 'OFFER');

-- Rejected/withdrawn/ghosted apps that already kept interview credit also kept a human screen
UPDATE "Application"
SET "recruiterReached" = true
WHERE "interviewReached" = true;

-- CreateIndex
CREATE INDEX "Application_oaReached_idx" ON "Application"("oaReached");
CREATE INDEX "Application_recruiterReached_idx" ON "Application"("recruiterReached");
