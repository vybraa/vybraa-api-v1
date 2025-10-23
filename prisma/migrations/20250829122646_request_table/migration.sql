-- CreateEnum
CREATE TYPE "RequestOccasion" AS ENUM ('BIRTHDAY_SHOUTOUT', 'ADVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "RecipientEnum" AS ENUM ('ME', 'FRIEND');

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "celebrityProfileId" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "occasion" "RequestOccasion" NOT NULL,
    "recipient" "RecipientEnum" NOT NULL,
    "forName" TEXT,
    "price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "serviceFeeId" TEXT,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vybra_billing_fee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vybra_billing_fee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_celebrityProfileId_fkey" FOREIGN KEY ("celebrityProfileId") REFERENCES "CelebrityProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_serviceFeeId_fkey" FOREIGN KEY ("serviceFeeId") REFERENCES "vybra_billing_fee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
