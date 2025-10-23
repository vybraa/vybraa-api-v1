/*
  Warnings:

  - A unique constraint covering the columns `[paymentReference]` on the table `requests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "paymentReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "requests_paymentReference_key" ON "requests"("paymentReference");
