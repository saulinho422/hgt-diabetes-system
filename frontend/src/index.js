import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Configuração inicial do sistema
console.log('🏥 Sistema HGT - Iniciando aplicação...');

// Verificação de compatibilidade do navegador
const checkBrowserSupport = () => {
  const requiredFeatures = [
    'localStorage' in window,
    'sessionStorage' in window,
    'fetch' in window,
    'Promise' in window
  ];
  
  const unsupportedFeatures = requiredFeatures.filter(feature => !feature);
  
  if (unsupportedFeatures.length > 0) {
    console.warn('⚠️ Algumas funcionalidades podem não estar disponíveis neste navegador');
  }
  
  return unsupportedFeatures.length === 0;
};

// Configuração de erro global
window.addEventListener('error', (event) => {
  console.error('💥 Erro global capturado:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  // Enviar erro para serviço de monitoramento (se configurado)
  if (process.env.NODE_ENV === 'production') {
    // Aqui você pode integrar com Sentry, LogRocket, etc.
  }
});

// Configuração de promise rejeitada não tratada
window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Promise rejeitada não tratada:', event.reason);
  
  if (process.env.NODE_ENV === 'production') {
    // Enviar para serviço de monitoramento
  }
});

// Função para inicializar a aplicação
const initializeApp = () => {
  try {
    // Verificar suporte do navegador
    if (!checkBrowserSupport()) {
      console.warn('⚠️ Navegador com suporte limitado detectado');
    }
    
    // Configurar timezone padrão se não estiver definido
    if (!localStorage.getItem('hgt_timezone')) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
      localStorage.setItem('hgt_timezone', timezone);
      console.log(`🌍 Timezone configurado para: ${timezone}`);
    }
    
    // Configurar tema padrão se não estiver definido
    if (!localStorage.getItem('hgt_theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      localStorage.setItem('hgt_theme', theme);
      console.log(`🎨 Tema configurado para: ${theme}`);
    }
    
    // Aplicar tema inicial
    const savedTheme = localStorage.getItem('hgt_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Configurar meta tags dinâmicas
    const setMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    setMetaTag('author', 'Sistema HGT');
    setMetaTag('keywords', 'diabetes, glicemia, insulina, hgt, controle glicêmico, saúde');
    
    console.log('✅ Aplicação inicializada com sucesso');
    
  } catch (error) {
    console.error('💥 Erro durante a inicialização:', error);
  }
};

// Criar root do React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar aplicação com tratamento de erro
try {
  initializeApp();
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('🚀 React renderizado com sucesso');
  
} catch (error) {
  console.error('💥 Erro ao renderizar aplicação:', error);
  
  // Renderizar tela de erro de fallback
  root.render(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '20px', fontSize: '24px' }}>
          ⚠️ Erro de Inicialização
        </h1>
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          Ocorreu um erro ao carregar o Sistema HGT. 
          Por favor, recarregue a página ou entre em contato com o suporte.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🔄 Recarregar Página
        </button>
      </div>
    </div>
  );
}

// Log de performance (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  // Medir tempo de carregamento
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ Página carregada em ${loadTime.toFixed(2)}ms`);
  });
  
  // Avisos de performance
  if (performance.mark) {
    performance.mark('hgt-app-start');
  }
}
