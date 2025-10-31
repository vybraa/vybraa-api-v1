-- CreateTable
CREATE TABLE "celebrity_gallery" (
    "id" TEXT NOT NULL,
    "celebrityProfileId" TEXT NOT NULL,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "celebrity_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "celebrity_gallery_celebrityProfileId_videoUrl_key" ON "celebrity_gallery"("celebrityProfileId", "videoUrl");

-- AddForeignKey
ALTER TABLE "celebrity_gallery" ADD CONSTRAINT "celebrity_gallery_celebrityProfileId_fkey" FOREIGN KEY ("celebrityProfileId") REFERENCES "CelebrityProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
