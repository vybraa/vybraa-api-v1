-- CreateEnum
CREATE TYPE "VybraaCurrency" AS ENUM ('USD', 'EUR', 'CNY');

-- AlterTable
ALTER TABLE "CelebrityProfile" ADD COLUMN     "requestPriceCurrency" "VybraaCurrency" NOT NULL DEFAULT 'USD';
