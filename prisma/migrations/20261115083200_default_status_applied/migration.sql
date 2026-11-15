-- New applications default to Applied instead of Wishlist
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'APPLIED';
