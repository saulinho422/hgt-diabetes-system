const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acesso negado. Token não fornecido.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await db('users')
      .where({ id: decoded.userId, active: true })
      .first();

    if (!user) {
      return res.status(401).json({ 
        error: 'Token inválido. Usuário não encontrado ou inativo.' 
      });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado.' 
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor.' 
    });
  }
};

module.exports = auth;
