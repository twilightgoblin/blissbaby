-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "refunds" ALTER COLUMN "currency" SET DEFAULT 'INR';
