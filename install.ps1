# 🏥 Script de Instalação do Sistema HGT para Windows
# PowerShell script para instalar e configurar o sistema completo

Write-Host "🏥 Iniciando instalação do Sistema HGT..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Blue

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion encontrado" -ForegroundColor Green
    
    # Verificar versão do Node.js
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 16) {
        Write-Host "❌ Node.js versão 16 ou superior é necessária. Versão atual: $nodeVersion" -ForegroundColor Red
        Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale Node.js >= 16.0.0" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar se PostgreSQL está disponível
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL não encontrado. Certifique-se de instalar PostgreSQL >= 12" -ForegroundColor Yellow
    Write-Host "   Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Instalando dependências do Backend..." -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue

# Navegar para o diretório do backend
Set-Location backend

# Instalar dependências do backend
npm install

# Copiar arquivo de configuração
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Arquivo .env criado. Configure suas variáveis de ambiente." -ForegroundColor Green
    Write-Host "📝 Edite o arquivo backend\.env com suas configurações:" -ForegroundColor Yellow
    Write-Host "   - Configurações do PostgreSQL" -ForegroundColor Yellow
    Write-Host "   - JWT Secret" -ForegroundColor Yellow
    Write-Host "   - Configurações de email (opcional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎨 Instalando dependências do Frontend..." -ForegroundColor Blue
Write-Host "=========================================="
Set-Location ..\frontend

# Instalar dependências do frontend
npm install

Write-Host ""
Write-Host "🗄️  Configuração do Banco de Dados" -ForegroundColor Blue
Write-Host "=================================="

$configureDB = Read-Host "Deseja configurar o banco de dados automaticamente? (y/n)"
if ($configureDB -eq 'y' -or $configureDB -eq 'Y') {
    $dbName = Read-Host "Nome do banco de dados [hgt_system]"
    if (-not $dbName) { $dbName = "hgt_system" }
    
    $dbUser = Read-Host "Usuário PostgreSQL [hgt_user]"
    if (-not $dbUser) { $dbUser = "hgt_user" }
    
    $dbPass = Read-Host "Senha para o usuário" -MaskInput
    
    $dbHost = Read-Host "Host do PostgreSQL [localhost]"
    if (-not $dbHost) { $dbHost = "localhost" }
    
    $dbPort = Read-Host "Porta do PostgreSQL [5432]"
    if (-not $dbPort) { $dbPort = "5432" }
    
    Write-Host "Criando banco de dados e usuário..." -ForegroundColor Blue
    
    # Criar banco e usuário PostgreSQL
    try {
        $env:PGPASSWORD = "postgres"
        psql -U postgres -h $dbHost -p $dbPort -c "CREATE DATABASE $dbName;"
        psql -U postgres -h $dbHost -p $dbPort -c "CREATE USER $dbUser WITH PASSWORD '$dbPass';"
        psql -U postgres -h $dbHost -p $dbPort -c "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;"
        psql -U postgres -h $dbHost -p $dbPort -c "ALTER USER $dbUser CREATEDB;"
        
        # Atualizar arquivo .env
        Set-Location ..\backend
        $envContent = Get-Content .env
        $envContent = $envContent -replace "DB_NAME=.*", "DB_NAME=$dbName"
        $envContent = $envContent -replace "DB_USER=.*", "DB_USER=$dbUser"
        $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$dbPass"
        $envContent = $envContent -replace "DB_HOST=.*", "DB_HOST=$dbHost"
        $envContent = $envContent -replace "DB_PORT=.*", "DB_PORT=$dbPort"
        $envContent | Set-Content .env
        
        Write-Host "✅ Banco de dados configurado" -ForegroundColor Green
        
        # Executar migrations
        Write-Host "Executando migrations..." -ForegroundColor Blue
        npm run migrate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migrations executadas com sucesso" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao executar migrations. Verifique as configurações do banco." -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro ao configurar banco de dados: $_" -ForegroundColor Red
        Write-Host "Configure manualmente o arquivo backend\.env" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔐 Configurando JWT Secret..." -ForegroundColor Blue
Write-Host "============================"

# Gerar JWT secret aleatório
$jwtSecret = -join ((1..64) | ForEach {Get-Random -input ([char[]]"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")})

Set-Location ..\backend
$envContent = Get-Content .env
$envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
$envContent | Set-Content .env

Write-Host "✅ JWT Secret configurado" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Instalação Concluída!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Blue
Write-Host ""
Write-Host "Para iniciar o sistema:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Backend (PowerShell 1):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Frontend (PowerShell 2):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs do sistema:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor Green
Write-Host "   Documentação API: http://localhost:3001/api-docs" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Arquivos importantes:" -ForegroundColor Yellow
Write-Host "   📋 README.md - Documentação completa" -ForegroundColor White
Write-Host "   ⚙️  backend\.env - Configurações do servidor" -ForegroundColor White
Write-Host "   🎯 sistema_hgt_prompt.yaml - Especificação do projeto" -ForegroundColor White
Write-Host ""
Write-Host "🩺 Pronto para usar o Sistema HGT!" -ForegroundColor Green
Write-Host "   Configure suas metas glicêmicas na primeira execução" -ForegroundColor White
Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Yellow
Write-Host "   - Backup automático ativado por padrão" -ForegroundColor White
Write-Host "   - Configure notificações para lembretes" -ForegroundColor White
Write-Host "   - Exporte dados regularmente para consultas médicas" -ForegroundColor White

# Retornar ao diretório inicial
Set-Location ..
