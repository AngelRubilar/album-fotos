-- Agregar columna categoryId a albums
ALTER TABLE "albums" ADD COLUMN "categoryId" TEXT;

-- Crear categorías para subAlbum existentes que aún no estén en categories
INSERT INTO "categories" ("id", "name", "createdAt")
SELECT
  substr(md5(random()::text || clock_timestamp()::text), 1, 25),
  t."subAlbum",
  NOW()
FROM (SELECT DISTINCT "subAlbum" FROM "albums" WHERE "subAlbum" IS NOT NULL) t
ON CONFLICT ("name") DO NOTHING;

-- Vincular albums existentes con su categoría por nombre
UPDATE "albums" a
SET "categoryId" = c.id
FROM "categories" c
WHERE a."subAlbum" = c.name;

-- Agregar FK con ON DELETE SET NULL (si se borra categoría, álbum queda sin categoría)
ALTER TABLE "albums"
  ADD CONSTRAINT "albums_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Índice para la FK
CREATE INDEX "albums_categoryId_idx" ON "albums"("categoryId");
