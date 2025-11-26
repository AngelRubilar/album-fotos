# 🐳 Guía de Migración y Backup de PostgreSQL en Docker

## 📦 Configuración Inicial

### 1. Levantar PostgreSQL con Docker

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Verificar que está corriendo
docker-compose ps

# Ver logs
docker-compose logs postgres
```

## 💾 Migración de Datos entre Servidores

### Opción 1: Exportar/Importar Volumen de Docker

#### Exportar datos del servidor actual:
```bash
# 1. Detener el contenedor
docker-compose down

# 2. Crear backup del volumen
docker run --rm \
  -v album-fotos_postgres_data:/data \
  -v ${PWD}/backups:/backup \
  alpine tar czf /backup/postgres-volume-backup.tar.gz -C /data .

# 3. El archivo estará en: ./backups/postgres-volume-backup.tar.gz
```

#### Importar datos en el nuevo servidor:
```bash
# 1. Copiar el archivo postgres-volume-backup.tar.gz al nuevo servidor

# 2. Crear el volumen en el nuevo servidor
docker volume create album-fotos_postgres_data

# 3. Restaurar datos
docker run --rm \
  -v album-fotos_postgres_data:/data \
  -v ${PWD}/backups:/backup \
  alpine tar xzf /backup/postgres-volume-backup.tar.gz -C /data

# 4. Levantar PostgreSQL
docker-compose up -d
```

### Opción 2: Backup SQL (Más Portable)

#### Crear backup SQL:
```bash
# Backup completo de la base de datos
docker-compose exec postgres pg_dump -U postgres album_fotos > backups/album_fotos_backup.sql

# O con compresión
docker-compose exec postgres pg_dump -U postgres album_fotos | gzip > backups/album_fotos_backup.sql.gz
```

#### Restaurar backup SQL en nuevo servidor:
```bash
# 1. Levantar PostgreSQL en el nuevo servidor
docker-compose up -d

# 2. Esperar que esté listo
docker-compose exec postgres pg_isready

# 3. Restaurar backup
docker-compose exec -T postgres psql -U postgres album_fotos < backups/album_fotos_backup.sql

# O si está comprimido
gunzip -c backups/album_fotos_backup.sql.gz | docker-compose exec -T postgres psql -U postgres album_fotos
```

## 🔄 Backups Automáticos

### Script de Backup Diario (Windows PowerShell)

Crear archivo `backup-db.ps1`:

```powershell
# Configuración
$BACKUP_DIR = "backups"
$DATE = Get-Date -Format "yyyy-MM-dd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR/album_fotos_$DATE.sql.gz"

# Crear directorio si no existe
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

# Ejecutar backup
docker-compose exec postgres pg_dump -U postgres album_fotos | gzip > $BACKUP_FILE

Write-Host "Backup creado: $BACKUP_FILE"

# Opcional: Eliminar backups antiguos (más de 30 días)
Get-ChildItem $BACKUP_DIR -Filter "album_fotos_*.sql.gz" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item

Write-Host "Backups antiguos eliminados"
```

### Script de Backup Diario (Linux/Mac)

Crear archivo `backup-db.sh`:

```bash
#!/bin/bash

# Configuración
BACKUP_DIR="backups"
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/album_fotos_$DATE.sql.gz"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Ejecutar backup
docker-compose exec postgres pg_dump -U postgres album_fotos | gzip > $BACKUP_FILE

echo "Backup creado: $BACKUP_FILE"

# Opcional: Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "album_fotos_*.sql.gz" -mtime +30 -delete

echo "Backups antiguos eliminados"
```

Hacer ejecutable:
```bash
chmod +x backup-db.sh
```

## 📊 Comandos Útiles

### Gestión de Contenedor
```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Reiniciar
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f postgres

# Acceder a PostgreSQL shell
docker-compose exec postgres psql -U postgres album_fotos
```

### Gestión de Volúmenes
```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect album-fotos_postgres_data

# Ubicación del volumen (Linux)
docker volume inspect album-fotos_postgres_data | grep Mountpoint

# Eliminar volumen (¡CUIDADO! Borra todos los datos)
docker-compose down -v
```

### Verificación de Datos
```bash
# Ver tamaño de la base de datos
docker-compose exec postgres psql -U postgres -c "\l+" album_fotos

# Ver tablas
docker-compose exec postgres psql -U postgres album_fotos -c "\dt"

# Contar registros
docker-compose exec postgres psql -U postgres album_fotos -c "SELECT COUNT(*) FROM albums;"
docker-compose exec postgres psql -U postgres album_fotos -c "SELECT COUNT(*) FROM images;"
```

## 🚀 Migración Completa Paso a Paso

### En el Servidor Origen:

```bash
# 1. Crear backup SQL
docker-compose exec postgres pg_dump -U postgres album_fotos | gzip > backups/migration_backup.sql.gz

# 2. Copiar estos archivos al nuevo servidor:
#    - docker-compose.yml
#    - .env
#    - backups/migration_backup.sql.gz
```

### En el Servidor Destino:

```bash
# 1. Crear carpeta del proyecto
mkdir album-fotos && cd album-fotos

# 2. Copiar archivos desde servidor origen
#    - docker-compose.yml
#    - .env
#    - backups/migration_backup.sql.gz

# 3. Levantar PostgreSQL
docker-compose up -d

# 4. Esperar que esté listo (unos segundos)
sleep 10

# 5. Restaurar backup
gunzip -c backups/migration_backup.sql.gz | docker-compose exec -T postgres psql -U postgres album_fotos

# 6. Verificar datos
docker-compose exec postgres psql -U postgres album_fotos -c "SELECT COUNT(*) FROM albums;"
```

## 🔐 Seguridad

### Cambiar Contraseña de PostgreSQL

1. Editar `docker-compose.yml`:
```yaml
environment:
  POSTGRES_PASSWORD: tu_nueva_contraseña_segura
```

2. Editar `.env`:
```
DATABASE_URL="postgresql://postgres:tu_nueva_contraseña_segura@localhost:5432/album_fotos?schema=public"
```

3. Recrear contenedor:
```bash
docker-compose down
docker-compose up -d
```

## 📁 Estructura de Archivos Recomendada

```
album-fotos/
├── docker-compose.yml          # Configuración de Docker
├── .env                        # Variables de entorno
├── backups/                    # Carpeta de backups
│   ├── album_fotos_2025-01-15.sql.gz
│   ├── album_fotos_2025-01-16.sql.gz
│   └── migration_backup.sql.gz
├── prisma/
│   └── schema.prisma
└── src/
    └── ...
```

## ⚠️ Notas Importantes

1. **Volúmenes Docker son persistentes**: Los datos sobreviven cuando detienes/reinicias el contenedor
2. **Para eliminar datos**: Usa `docker-compose down -v` (¡cuidado!)
3. **Backups regulares**: Automatiza backups para no perder datos
4. **Migración entre sistemas**: Usa backups SQL (más portables entre diferentes OS)
5. **Versión de PostgreSQL**: Mantén la misma versión (15-alpine) en origen y destino

## 🔍 Troubleshooting

### El contenedor no inicia
```bash
# Ver logs detallados
docker-compose logs postgres

# Verificar puerto 5432 no esté ocupado
netstat -ano | findstr :5432  # Windows
lsof -i :5432                 # Linux/Mac
```

### Error de conexión desde la app
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Verificar salud del contenedor
docker-compose exec postgres pg_isready -U postgres
```

### Error al restaurar backup
```bash
# Recrear la base de datos limpia
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS album_fotos;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE album_fotos;"

# Intentar restaurar nuevamente
gunzip -c backups/backup.sql.gz | docker-compose exec -T postgres psql -U postgres album_fotos
```
