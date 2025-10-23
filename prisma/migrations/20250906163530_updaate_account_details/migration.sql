/*
  Warnings:

  - Added the required column `accountName` to the `UserAccountDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAccountDetails" ADD COLUMN     "accountName" TEXT NOT NULL;
