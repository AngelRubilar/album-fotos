# Script de Restauración de PostgreSQL
# Ejecutar: .\restore-db.ps1 <archivo_backup>

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Error: El archivo $BackupFile no existe" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  ADVERTENCIA: Esto reemplazará todos los datos actuales" -ForegroundColor Yellow
$confirm = Read-Host "¿Deseas continuar? (s/N)"

if ($confirm -ne "s") {
    Write-Host "❌ Restauración cancelada" -ForegroundColor Red
    exit 0
}

Write-Host "📥 Restaurando base de datos desde: $BackupFile" -ForegroundColor Cyan

# Recrear la base de datos limpia
docker-compose exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS album_fotos;"
docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE album_fotos;"

# Restaurar backup
Get-Content $BackupFile | docker-compose exec -T postgres psql -U postgres album_fotos

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos restaurada exitosamente" -ForegroundColor Green

    # Verificar datos
    Write-Host "`n📊 Verificando datos..." -ForegroundColor Cyan
    docker-compose exec postgres psql -U postgres album_fotos -c "SELECT COUNT(*) FROM albums;"
} else {
    Write-Host "❌ Error al restaurar backup" -ForegroundColor Red
    exit 1
}
