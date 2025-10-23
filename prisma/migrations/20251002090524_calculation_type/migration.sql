-- CreateEnum
CREATE TYPE "CalculationType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "vybraa_config_settings" ADD COLUMN     "calculationType" "CalculationType" NOT NULL DEFAULT 'PERCENTAGE';
