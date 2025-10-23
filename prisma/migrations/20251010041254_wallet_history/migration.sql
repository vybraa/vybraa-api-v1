-- CreateEnum
CREATE TYPE "WalletEarningsHistoryStatus" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "wallet_earnings_history" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "walletId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "vybraaFee" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "WalletEarningsHistoryStatus" NOT NULL DEFAULT 'CREDIT',

    CONSTRAINT "wallet_earnings_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wallet_earnings_history" ADD CONSTRAINT "wallet_earnings_history_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_earnings_history" ADD CONSTRAINT "wallet_earnings_history_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
