#!/bin/bash

# 🏥 Script de Instalação do Sistema HGT
# Instala e configura o sistema completo

echo "🏥 Iniciando instalação do Sistema HGT..."
echo "================================================"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js >= 16.0.0"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão 16 ou superior é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar se PostgreSQL está disponível
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL não encontrado. Certifique-se de instalar PostgreSQL >= 12"
    echo "   Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "   CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
    echo "   macOS: brew install postgresql"
fi

# Criar diretório principal se não existir
mkdir -p hgt-system
cd hgt-system

echo ""
echo "📦 Instalando dependências do Backend..."
echo "========================================="
cd backend

# Instalar dependências do backend
npm install

# Copiar arquivo de configuração
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado. Configure suas variáveis de ambiente."
    echo "📝 Edite o arquivo backend/.env com suas configurações:"
    echo "   - Configurações do PostgreSQL"
    echo "   - JWT Secret"
    echo "   - Configurações de email (opcional)"
fi

echo ""
echo "🎨 Instalando dependências do Frontend..."
echo "=========================================="
cd ../frontend

# Instalar dependências do frontend
npm install

echo ""
echo "🗄️  Configuração do Banco de Dados"
echo "=================================="

read -p "Deseja configurar o banco de dados automaticamente? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Nome do banco de dados [hgt_system]: " DB_NAME
    DB_NAME=${DB_NAME:-hgt_system}
    
    read -p "Usuário PostgreSQL [hgt_user]: " DB_USER
    DB_USER=${DB_USER:-hgt_user}
    
    read -s -p "Senha para o usuário: " DB_PASS
    echo
    
    read -p "Host do PostgreSQL [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "Porta do PostgreSQL [5432]: " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    echo "Criando banco de dados e usuário..."
    
    # Criar banco e usuário PostgreSQL
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"
    
    # Atualizar arquivo .env
    cd ../backend
    sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
    sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
    sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
    sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env
    
    echo "✅ Banco de dados configurado"
    
    # Executar migrations
    echo "Executando migrations..."
    npm run migrate
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrations executadas com sucesso"
    else
        echo "❌ Erro ao executar migrations. Verifique as configurações do banco."
    fi
fi

echo ""
echo "🔐 Configurando JWT Secret..."
echo "============================"

# Gerar JWT secret aleatório
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env

echo "✅ JWT Secret configurado"

echo ""
echo "🎉 Instalação Concluída!"
echo "========================"
echo ""
echo "Para iniciar o sistema:"
echo ""
echo "1️⃣  Backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2️⃣  Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "🌐 URLs do sistema:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Documentação API: http://localhost:3001/api-docs"
echo ""
echo "📚 Arquivos importantes:"
echo "   📋 README.md - Documentação completa"
echo "   ⚙️  backend/.env - Configurações do servidor"
echo "   🎯 sistema_hgt_prompt.yaml - Especificação do projeto"
echo ""
echo "🩺 Pronto para usar o Sistema HGT!"
echo "   Configure suas metas glicêmicas na primeira execução"
echo ""
echo "💡 Dicas:"
echo "   - Backup automático ativado por padrão"
echo "   - Configure notificações para lembretes"
echo "   - Exporte dados regularmente para consultas médicas"
