/*
  Warnings:

  - A unique constraint covering the columns `[bankCode,accountNumber,userId]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "bank_accounts_bankCode_accountNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_bankCode_accountNumber_userId_key" ON "bank_accounts"("bankCode", "accountNumber", "userId");
