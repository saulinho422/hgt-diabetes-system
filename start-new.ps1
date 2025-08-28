# 🚀 Script de Inicialização do Sistema HGT para Windows
# PowerShell script para iniciar o frontend (usando Supabase como backend)

Write-Host "🚀 Iniciando Sistema HGT..." -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Blue

# Verificar se estamos no diretório correto
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Execute este script no diretório raiz do projeto (hgt-system\)" -ForegroundColor Red
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "❌ Dependências do frontend não instaladas. Instalando agora..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências." -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

# Verificar arquivo .env
if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚠️  Arquivo .env não encontrado. Copiando exemplo..." -ForegroundColor Yellow
    if (Test-Path "frontend\.env.example") {
        Copy-Item "frontend\.env.example" "frontend\.env"
        Write-Host "📝 Configure suas variáveis do Supabase no arquivo frontend\.env" -ForegroundColor Cyan
    }
}

Write-Host "✅ Iniciando frontend React em http://localhost:3000..." -ForegroundColor Green
Write-Host "🌐 O navegador será aberto automaticamente" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛑 Para parar o sistema: Ctrl+C" -ForegroundColor Red
Write-Host ""

# Iniciar frontend
Set-Location frontend
npm start

Write-Host ""
Write-Host "🎉 Sistema HGT finalizado!" -ForegroundColor Green
