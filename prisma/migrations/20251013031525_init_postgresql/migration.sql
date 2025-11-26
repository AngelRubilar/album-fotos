-- CreateTable
CREATE TABLE "public"."albums" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."images" (
    "id" TEXT NOT NULL,
    "albumId" TEXT,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "albums_year_key" ON "public"."albums"("year");

-- CreateIndex
CREATE INDEX "albums_year_idx" ON "public"."albums"("year");

-- CreateIndex
CREATE INDEX "albums_createdAt_idx" ON "public"."albums"("createdAt");

-- CreateIndex
CREATE INDEX "images_albumId_idx" ON "public"."images"("albumId");

-- CreateIndex
CREATE INDEX "images_uploadedAt_idx" ON "public"."images"("uploadedAt");

-- CreateIndex
CREATE INDEX "images_albumId_uploadedAt_idx" ON "public"."images"("albumId", "uploadedAt");

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
