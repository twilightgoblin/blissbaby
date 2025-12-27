-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "refunds" ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT;
