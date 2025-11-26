# Script de Backup de PostgreSQL
# Ejecutar: .\backup-db.ps1

$BACKUP_DIR = "backups"
$DATE = Get-Date -Format "yyyy-MM-dd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR/album_fotos_$DATE.sql"

# Crear directorio si no existe
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "📦 Creando backup de la base de datos..." -ForegroundColor Cyan

# Ejecutar backup
docker-compose exec -T postgres pg_dump -U postgres album_fotos > $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup creado exitosamente: $BACKUP_FILE" -ForegroundColor Green

    # Mostrar tamaño del archivo
    $size = (Get-Item $BACKUP_FILE).Length / 1KB
    Write-Host "📊 Tamaño: $([math]::Round($size, 2)) KB" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error al crear backup" -ForegroundColor Red
    exit 1
}

# Opcional: Eliminar backups antiguos (más de 30 días)
$oldBackups = Get-ChildItem $BACKUP_DIR -Filter "album_fotos_*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }

if ($oldBackups) {
    Write-Host "🗑️  Eliminando backups antiguos..." -ForegroundColor Yellow
    $oldBackups | Remove-Item
    Write-Host "✅ Backups antiguos eliminados" -ForegroundColor Green
}

Write-Host "`n📝 Comandos útiles:" -ForegroundColor Cyan
Write-Host "  Ver backups:     Get-ChildItem $BACKUP_DIR" -ForegroundColor White
Write-Host "  Restaurar:       Get-Content $BACKUP_FILE | docker-compose exec -T postgres psql -U postgres album_fotos" -ForegroundColor White
