-- Migración: Agregar campo subAlbum y permitir múltiples álbumes por año
-- Fecha: 2024-11-24

-- 1. Primero eliminar el constraint UNIQUE de year (para permitir múltiples álbumes por año)
DROP INDEX IF EXISTS "albums_year_key";

-- 2. Agregar columna subAlbum
ALTER TABLE "albums" ADD COLUMN IF NOT EXISTS "subAlbum" TEXT;

-- 3. Actualizar title para que no sea NULL (poner valor por defecto si hay nulls)
UPDATE "albums" SET "title" = CONCAT('Álbum ', "year") WHERE "title" IS NULL;

-- 4. Hacer title NOT NULL
ALTER TABLE "albums" ALTER COLUMN "title" SET NOT NULL;

-- 5. Crear índice único compuesto (year, title, subAlbum)
CREATE UNIQUE INDEX IF NOT EXISTS "albums_year_title_subAlbum_key" ON "albums"("year", "title", "subAlbum");
