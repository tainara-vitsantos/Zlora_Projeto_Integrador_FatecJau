
# ==========================================
# BACKUP AUTOMATICO - BANCO ZLORA
# Banco de Dados No Relacional - MongoDB
# ==========================================

# Localiza a raiz do projeto
$projectPath = Split-Path $PSScriptRoot -Parent

# Define o banco e a pasta de destino
$database = "zlora"
$backupFolder = Join-Path $projectPath "backups"
$logFile = Join-Path $backupFolder "backup.log"

# Cria a pasta de backup, caso nao exista
New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null

# Funcao para registrar mensagens no log
function Write-Log {
    param([string]$Message)

    $dateLog = Get-Date -Format "dd/MM/yyyy HH:mm:ss"
    $line = "[$dateLog] $Message"

    Write-Host $line
    Add-Content -Path $logFile -Value $line
}

# Verifica se o mongodump esta instalado
if (-not (Get-Command mongodump -ErrorAction SilentlyContinue)) {
    Write-Log "ERRO: mongodump nao encontrado. Verifique a instalacao do MongoDB Database Tools."
    exit 1
}

# Cria identificacao com data e horario
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$destination = Join-Path $backupFolder "zlora_$date"

# Cria a pasta do backup
New-Item -ItemType Directory -Force -Path $destination | Out-Null

Write-Log "Iniciando backup do banco $database..."

# Executa o backup
mongodump --uri="mongodb://localhost:27017" --db="$database" --out="$destination"

# Guarda o resultado do comando
$backupExitCode = $LASTEXITCODE

# Verifica se o backup foi realizado
$databaseBackup = Join-Path $destination $database
$backupFiles = Get-ChildItem -Path $databaseBackup -File -ErrorAction SilentlyContinue

if ($backupExitCode -eq 0 -and $backupFiles.Count -gt 0) {
    Write-Log "SUCESSO: Backup realizado."
    Write-Log "Local: $destination"
}
else {
    Write-Log "ERRO: Falha ao realizar o backup."

    # Remove a pasta incompleta
    Remove-Item -Path $destination -Recurse -Force -ErrorAction SilentlyContinue

    exit 1
}
