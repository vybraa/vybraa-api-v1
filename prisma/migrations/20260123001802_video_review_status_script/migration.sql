-- CreateEnum
CREATE TYPE "VideoReviewUrlStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "suggestedAiVideoScript" TEXT,
ADD COLUMN     "videoReviewUrlStatus" "VideoReviewUrlStatus" DEFAULT 'PENDING';
