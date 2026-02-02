/*
  Warnings:

  - A unique constraint covering the columns `[transferRecipientId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "transferRecipientId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_transferRecipientId_key" ON "User"("transferRecipientId");
