CREATE TABLE "year_covers" (
  "year" INTEGER NOT NULL,
  "coverImageUrl" TEXT NOT NULL,
  "coverFocalPoint" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "year_covers_pkey" PRIMARY KEY ("year")
);
