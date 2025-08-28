import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar o Dashboard (que tem a tela de login)
  if (!user) {
    return <Dashboard />;
  }

  // Se estiver logado, mostrar o conteúdo protegido
  return children;
};

export default ProtectedRoute;
