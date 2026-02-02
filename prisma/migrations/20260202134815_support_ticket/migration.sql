-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SupportTicketCategory" AS ENUM ('GENERAL_SUPPORT', 'TECHNICAL_SUPPORT', 'ACCOUNT_SUPPORT', 'PAYMENT_SUPPORT', 'REQUEST_SUPPORT', 'WITHDRAWAL_SUPPORT', 'DISPUTE_SUPPORT', 'VERIFICATION_SUPPORT', 'OTHER_SUPPORT', 'OTHER');

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "SupportTicketPriority" NOT NULL DEFAULT 'LOW',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "category" "SupportTicketCategory" NOT NULL DEFAULT 'GENERAL_SUPPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_tickets_userId_idx" ON "support_tickets"("userId");

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
