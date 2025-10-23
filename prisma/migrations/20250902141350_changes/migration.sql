/*
  Warnings:

  - Made the column `serviceFeeId` on table `requests` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_serviceFeeId_fkey";

-- AlterTable
ALTER TABLE "CelebrityProfile" ALTER COLUMN "isUnderReview" SET DEFAULT true;

-- AlterTable
ALTER TABLE "requests" ALTER COLUMN "serviceFeeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_serviceFeeId_fkey" FOREIGN KEY ("serviceFeeId") REFERENCES "vybra_billing_fee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
