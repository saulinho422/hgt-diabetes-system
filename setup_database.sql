-- 🏥 Script de Configuração do Banco de Dados - Sistema HGT
-- Execute estes comandos no pgAdmin para configurar o banco

-- 1. Criar o banco de dados
CREATE DATABASE hgt_system
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 2. Criar usuário específico para a aplicação
CREATE USER hgt_user WITH PASSWORD 'hgt_123456';

-- 3. Conceder privilégios ao usuário
GRANT ALL PRIVILEGES ON DATABASE hgt_system TO hgt_user;
GRANT CREATE ON SCHEMA public TO hgt_user;
GRANT USAGE ON SCHEMA public TO hgt_user;

-- 4. Conectar ao banco hgt_system e executar:
\c hgt_system;

-- 5. Conceder privilégios no schema public
GRANT ALL ON SCHEMA public TO hgt_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hgt_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hgt_user;

-- 6. Definir privilégios padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hgt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hgt_user;

-- Verificar se tudo foi criado corretamente
SELECT datname FROM pg_database WHERE datname = 'hgt_system';
SELECT usename FROM pg_user WHERE usename = 'hgt_user';
