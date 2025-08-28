# 🚀 Script de Inicialização Rápida do Sistema HGT para Windows
# PowerShell script para iniciar frontend e backend simultaneamente

Write-Host "🚀 Iniciando Sistema HGT..." -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Blue

# Verificar se estamos no diretório correto
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Execute este script no diretório raiz do projeto (hgt-system\)" -ForegroundColor Red
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "❌ Dependências do backend não instaladas. Execute: npm install" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "❌ Dependências do frontend não instaladas. Execute: npm install" -ForegroundColor Red
    exit 1
}

# Verificar arquivo .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ Arquivo .env não encontrado. Configure o backend primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Iniciando backend na porta 3001..." -ForegroundColor Green

# Iniciar backend em job separado
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    npm run dev
}

Start-Sleep 3

Write-Host "✅ Iniciando frontend na porta 3000..." -ForegroundColor Green

# Iniciar frontend em job separado
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm start
}

Write-Host ""
Write-Host "🎉 Sistema HGT iniciado com sucesso!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""
Write-Host "🌐 URLs disponíveis:" -ForegroundColor Yellow
Write-Host "   📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   🔗 API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   📚 Docs: http://localhost:3001/api-docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Monitores:" -ForegroundColor Yellow
Write-Host "   Backend Job ID: $($backendJob.Id)" -ForegroundColor White
Write-Host "   Frontend Job ID: $($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Para parar o sistema: Ctrl+C ou feche esta janela" -ForegroundColor Red
Write-Host ""
Write-Host "🔍 Para verificar logs:" -ForegroundColor Yellow
Write-Host "   Backend: Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor White
Write-Host "   Frontend: Receive-Job -Id $($frontendJob.Id) -Keep" -ForegroundColor White

# Aguardar entrada do usuário ou Ctrl+C
try {
    Write-Host "Pressione Ctrl+C para parar o sistema..." -ForegroundColor Yellow
    while ($true) {
        Start-Sleep 1
        
        # Verificar se os jobs ainda estão rodando
        if ($backendJob.State -eq "Failed" -or $backendJob.State -eq "Completed") {
            Write-Host "❌ Backend parou inesperadamente!" -ForegroundColor Red
            Receive-Job $backendJob
            break
        }
        
        if ($frontendJob.State -eq "Failed" -or $frontendJob.State -eq "Completed") {
            Write-Host "❌ Frontend parou inesperadamente!" -ForegroundColor Red
            Receive-Job $frontendJob
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Parando sistema..." -ForegroundColor Red
    
    # Parar jobs
    Stop-Job $backendJob, $frontendJob -PassThru | Remove-Job
    
    Write-Host "✅ Sistema parado com sucesso!" -ForegroundColor Green
}
