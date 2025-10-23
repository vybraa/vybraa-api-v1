/*
  Warnings:

  - You are about to drop the column `walletId` on the `wallet_transactions` table. All the data in the column will be lost.
  - You are about to drop the `escrow_transactions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `wallet_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "escrow_transactions" DROP CONSTRAINT "escrow_transactions_walletId_fkey";

-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_walletId_fkey";

-- AlterTable
ALTER TABLE "wallet_transactions" DROP COLUMN "walletId",
ADD COLUMN     "escrowStatus" "EscrowStatus",
ADD COLUMN     "escrowType" "EscrowType",
ADD COLUMN     "isInEscrow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "releaseDate" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "escrow_transactions";

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
