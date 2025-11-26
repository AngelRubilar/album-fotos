# ✅ Resumen de Migración a PostgreSQL

## 🎉 Migración Completada Exitosamente

Tu aplicación ahora está usando **PostgreSQL en Docker** en lugar de SQLite.

## 📊 Estado Actual

### Base de Datos
- **Motor**: PostgreSQL 15 (Alpine)
- **Contenedor**: `album-fotos-postgres`
- **Puerto**: 5432
- **Base de datos**: `album_fotos`
- **Usuario**: `postgres`
- **Contraseña**: `password` (¡cámbiala en producción!)

### Datos Iniciales
- ✅ 4 álbumes creados (2021-2024)
- ✅ Migraciones aplicadas
- ✅ Prisma Client generado

## 🐳 Comandos Docker Esenciales

### Gestión del Contenedor
```bash
# Iniciar PostgreSQL
docker-compose up -d

# Detener PostgreSQL
docker-compose down

# Ver logs
docker-compose logs postgres -f

# Estado del contenedor
docker-compose ps
```

### Acceso a PostgreSQL
```bash
# Acceder a la consola de PostgreSQL
docker-compose exec postgres psql -U postgres album_fotos

# Ejecutar consulta directa
docker-compose exec postgres psql -U postgres album_fotos -c "SELECT * FROM albums;"
```

## 💾 Backup y Restauración

### Crear Backup (Windows)
```powershell
# Ejecutar script de backup
.\backup-db.ps1

# O manualmente
docker-compose exec postgres pg_dump -U postgres album_fotos > backups/backup.sql
```

### Restaurar Backup (Windows)
```powershell
# Ejecutar script de restauración
.\restore-db.ps1 backups/backup.sql

# O manualmente
Get-Content backups/backup.sql | docker-compose exec -T postgres psql -U postgres album_fotos
```

### Crear Backup (Linux/Mac)
```bash
# Crear backup
docker-compose exec postgres pg_dump -U postgres album_fotos > backups/backup.sql

# Con compresión
docker-compose exec postgres pg_dump -U postgres album_fotos | gzip > backups/backup.sql.gz
```

### Restaurar Backup (Linux/Mac)
```bash
# Restaurar backup
cat backups/backup.sql | docker-compose exec -T postgres psql -U postgres album_fotos

# Si está comprimido
gunzip -c backups/backup.sql.gz | docker-compose exec -T postgres psql -U postgres album_fotos
```

## 🚀 Migración entre Servidores

### Exportar desde Servidor A:
```bash
# 1. Crear backup
docker-compose exec postgres pg_dump -U postgres album_fotos | gzip > album_fotos_export.sql.gz

# 2. Copiar estos archivos al nuevo servidor:
#    - docker-compose.yml
#    - .env
#    - album_fotos_export.sql.gz
```

### Importar en Servidor B:
```bash
# 1. Copiar archivos recibidos

# 2. Levantar PostgreSQL
docker-compose up -d

# 3. Esperar 10 segundos
sleep 10

# 4. Restaurar datos
gunzip -c album_fotos_export.sql.gz | docker-compose exec -T postgres psql -U postgres album_fotos

# 5. Verificar
docker-compose exec postgres psql -U postgres album_fotos -c "SELECT COUNT(*) FROM albums;"
```

## 📁 Persistencia de Datos

### Volumen de Docker
Los datos se guardan en el volumen de Docker: `album-fotos_postgres_data`

```bash
# Ver información del volumen
docker volume inspect album-fotos_postgres_data

# Listar todos los volúmenes
docker volume ls
```

### Backup del Volumen Completo
```bash
# Exportar volumen (mejor portabilidad)
docker run --rm \
  -v album-fotos_postgres_data:/data \
  -v ${PWD}/backups:/backup \
  alpine tar czf /backup/postgres-volume.tar.gz -C /data .

# Importar volumen en otro servidor
docker volume create album-fotos_postgres_data
docker run --rm \
  -v album-fotos_postgres_data:/data \
  -v ${PWD}/backups:/backup \
  alpine tar xzf /backup/postgres-volume.tar.gz -C /data
```

## 🔒 Seguridad (IMPORTANTE)

### Cambiar Contraseña de Producción

1. **Editar docker-compose.yml**:
```yaml
environment:
  POSTGRES_PASSWORD: TU_CONTRASEÑA_SEGURA_AQUI
```

2. **Editar .env**:
```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA_SEGURA_AQUI@localhost:5432/album_fotos?schema=public"
```

3. **Recrear contenedor**:
```bash
docker-compose down
docker-compose up -d
```

## 🛠️ Comandos de Desarrollo

### Prisma
```bash
# Ver base de datos en navegador
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Resetear base de datos
npx prisma migrate reset
```

### Aplicación Next.js
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start
```

## 📝 Archivos Importantes

- `docker-compose.yml` - Configuración de PostgreSQL
- `.env` - Variables de entorno (¡NO COMMITEAR!)
- `prisma/schema.prisma` - Schema de la base de datos
- `GUIA_MIGRACION_DOCKER.md` - Guía completa de migración
- `backup-db.ps1` - Script de backup (Windows)
- `restore-db.ps1` - Script de restauración (Windows)

## ⚠️ Notas Importantes

1. **Los datos persisten** cuando detienes el contenedor con `docker-compose down`
2. **Los datos se BORRAN** si usas `docker-compose down -v` (elimina volúmenes)
3. **Haz backups regulares** antes de cambios importantes
4. **Usa la misma versión de PostgreSQL** (15-alpine) en todos los servidores
5. **Cambia la contraseña** antes de producción

## 🔍 Verificación

### Comprobar que todo funciona:
```bash
# 1. PostgreSQL corriendo
docker-compose ps

# 2. Base de datos accesible
docker-compose exec postgres pg_isready -U postgres

# 3. Datos presentes
docker-compose exec postgres psql -U postgres album_fotos -c "SELECT COUNT(*) FROM albums;"

# 4. Aplicación funcionando
npm run dev
# Abrir: http://localhost:3000
```

## 📞 Troubleshooting

### Puerto 5432 ocupado
```bash
# Windows
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :5432
```

### Ver logs de errores
```bash
docker-compose logs postgres --tail 50
```

### Recrear contenedor desde cero
```bash
# ⚠️ ESTO BORRA TODOS LOS DATOS
docker-compose down -v
docker-compose up -d
npm run db:seed
```

## 🎯 Próximos Pasos

1. ✅ Cambiar contraseña de producción
2. ✅ Configurar backups automáticos
3. ✅ Probar la aplicación en http://localhost:3000
4. ✅ Subir imágenes y probar funcionalidades
5. ✅ Crear backup antes de cambios importantes

---

**¡Migración completada con éxito!** 🎉

Tu aplicación ahora usa PostgreSQL en Docker y puedes mover fácilmente tu base de datos entre servidores usando backups SQL o volúmenes de Docker.
