-- AlterTable
ALTER TABLE "FlutterWaveKey" ADD COLUMN     "access_token" TEXT;

-- CreateTable
CREATE TABLE "UserAccountDetails" (
    "id" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "routingNumber" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserAccountDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAccountDetails" ADD CONSTRAINT "UserAccountDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
