-- AlterTable
ALTER TABLE "vybra_billing_fee" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "price" DECIMAL(15,2) NOT NULL DEFAULT 0;
