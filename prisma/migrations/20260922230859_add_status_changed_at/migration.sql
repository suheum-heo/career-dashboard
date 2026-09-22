-- AlterTable
ALTER TABLE "Application" ADD COLUMN "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill from applied/created date so existing stale apps can auto-ghost
UPDATE "Application"
SET "statusChangedAt" = COALESCE("dateApplied", "createdAt");

-- CreateIndex
CREATE INDEX "Application_statusChangedAt_idx" ON "Application"("statusChangedAt");
