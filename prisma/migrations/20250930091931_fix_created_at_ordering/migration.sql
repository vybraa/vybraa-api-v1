/*
  Warnings:

  - Made the column `createdAt` on table `requests` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "requests" ALTER COLUMN "createdAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "requests_createdAt_idx" ON "requests"("createdAt");
