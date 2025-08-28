#!/bin/bash

# 🚀 Script de Inicialização Rápida do Sistema HGT
# Inicia frontend e backend simultaneamente

echo "🚀 Iniciando Sistema HGT..."
echo "=========================="

# Verificar se estamos no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Execute este script no diretório raiz do projeto (hgt-system/)"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "backend/node_modules" ]; then
    echo "❌ Dependências do backend não instaladas. Execute: npm install"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Dependências do frontend não instaladas. Execute: npm install"
    exit 1
fi

# Verificar arquivo .env
if [ ! -f "backend/.env" ]; then
    echo "❌ Arquivo .env não encontrado. Configure o backend primeiro."
    exit 1
fi

echo "✅ Iniciando backend na porta 3001..."
cd backend
npm run dev &
BACKEND_PID=$!

# Aguardar backend inicializar
sleep 3

echo "✅ Iniciando frontend na porta 3000..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Sistema HGT iniciado com sucesso!"
echo "=================================="
echo ""
echo "🌐 URLs disponíveis:"
echo "   📱 Frontend: http://localhost:3000"
echo "   🔗 API: http://localhost:3001"
echo "   📚 Docs: http://localhost:3001/api-docs"
echo ""
echo "📊 Monitores:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 Para parar o sistema: Ctrl+C"

# Aguardar sinal de parada
trap "echo ''; echo '🛑 Parando sistema...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT

# Manter o script em execução
wait
