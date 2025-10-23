-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'DECLINED');

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "status" "RequestStatus" NOT NULL DEFAULT 'PENDING';
