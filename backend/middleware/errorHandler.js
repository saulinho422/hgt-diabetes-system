const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erro de validação do express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors
    });
  }

  // Erro de violação de constraint do banco
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Dados duplicados',
      message: 'Este registro já existe no sistema'
    });
  }

  // Erro de chave estrangeira
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referência inválida',
      message: 'Dados relacionados não encontrados'
    });
  }

  // Erro de JSON inválido
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'Formato de dados incorreto'
    });
  }

  // Erro de limite de tamanho
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Arquivo muito grande',
      message: 'O arquivo excede o tamanho máximo permitido'
    });
  }

  // Erro padrão
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
