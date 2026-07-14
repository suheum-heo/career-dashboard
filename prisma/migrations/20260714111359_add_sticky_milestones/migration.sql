-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "interviewReached" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerReceived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responseReceived" BOOLEAN NOT NULL DEFAULT false;

-- Backfill from current status (historical rejected-after-interview must be set manually)
UPDATE "Application"
SET "interviewReached" = true
WHERE status IN ('RECRUITER_SCREEN', 'INTERVIEW', 'FINAL_ROUND', 'OFFER');

UPDATE "Application"
SET "offerReceived" = true
WHERE status = 'OFFER';

UPDATE "Application"
SET "responseReceived" = true
WHERE status IN ('OA', 'RECRUITER_SCREEN', 'INTERVIEW', 'FINAL_ROUND', 'OFFER', 'REJECTED');

-- CreateIndex
CREATE INDEX "Application_interviewReached_idx" ON "Application"("interviewReached");

-- CreateIndex
CREATE INDEX "Application_offerReceived_idx" ON "Application"("offerReceived");

-- CreateIndex
CREATE INDEX "Application_responseReceived_idx" ON "Application"("responseReceived");
