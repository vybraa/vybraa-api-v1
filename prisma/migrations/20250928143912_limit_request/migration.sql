-- CreateTable
CREATE TABLE "request_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 10,
    "currentMonthCount" INTEGER NOT NULL DEFAULT 0,
    "resetDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "request_limits_userId_key" ON "request_limits"("userId");

-- AddForeignKey
ALTER TABLE "request_limits" ADD CONSTRAINT "request_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
