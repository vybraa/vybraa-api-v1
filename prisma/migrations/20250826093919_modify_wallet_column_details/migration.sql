/*
  Warnings:

  - You are about to drop the column `availableBalance` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `wallets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "availableBalance",
DROP COLUMN "balance",
ADD COLUMN     "totalBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "walletBalance" DECIMAL(15,2) NOT NULL DEFAULT 0;
