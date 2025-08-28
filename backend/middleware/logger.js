const logger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || '';

  // Log da requisição
  console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip}`);

  // Interceptar a resposta para logar o status
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Cor baseada no status
    const getStatusColor = (status) => {
      if (status >= 500) return '\x1b[31m'; // Vermelho
      if (status >= 400) return '\x1b[33m'; // Amarelo
      if (status >= 300) return '\x1b[36m'; // Ciano
      if (status >= 200) return '\x1b[32m'; // Verde
      return '\x1b[0m'; // Padrão
    };

    const color = getStatusColor(statusCode);
    const reset = '\x1b[0m';

    console.log(
      `[${new Date().toISOString()}] ${color}${statusCode}${reset} ${method} ${url} - ${duration}ms`
    );

    // Log adicional para erros
    if (statusCode >= 400) {
      console.log(`  Error details: ${data}`);
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
