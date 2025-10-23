-- CreateTable
CREATE TABLE "FlutterWaveKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlutterWaveKey_pkey" PRIMARY KEY ("id")
);
