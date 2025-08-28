const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const glucoseRoutes = require('./routes/glucose');
const insulinRoutes = require('./routes/insulin');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const backupRoutes = require('./routes/backup');

// Importar middlewares
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Importar configuração do banco
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger personalizado
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Documentação da API (Swagger)
if (process.env.NODE_ENV !== 'production') {
  const swaggerJsDoc = require('swagger-jsdoc');
  const swaggerUI = require('swagger-ui-express');
  
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Sistema HGT API',
        version: '1.0.0',
        description: 'API para controle glicêmico e diabetes',
        contact: {
          name: 'Sistema HGT',
          email: 'contato@sistemahgt.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Servidor de desenvolvimento'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    apis: ['./routes/*.js']
  };
  
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
}

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/glucose', glucoseRoutes);
app.use('/api/insulin', insulinRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);

// Rota para arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Middleware de tratamento de erros
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Inicialização do servidor
const startServer = async () => {
  try {
    // Testar conexão com o banco
    await db.raw('SELECT 1');
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Executar migrations
    if (process.env.NODE_ENV !== 'test') {
      await db.migrate.latest();
      console.log('✅ Migrations executadas');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📋 Documentação da API: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais de processo
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT. Encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor apenas se não for um teste
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
