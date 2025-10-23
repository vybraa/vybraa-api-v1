/*
  Warnings:

  - Changed the type of `currency` on the `wallet_transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "wallet_transactions" DROP COLUMN "currency",
ADD COLUMN     "currency" TEXT NOT NULL;
