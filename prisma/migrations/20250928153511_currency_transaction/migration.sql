/*
  Warnings:

  - Added the required column `currency` to the `wallet_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "currency" "VybraaCurrency" NOT NULL;
