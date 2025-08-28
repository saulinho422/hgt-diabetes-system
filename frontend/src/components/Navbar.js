import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Plus, 
  History, 
  BarChart3, 
  Settings,
  Heart,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();
  
  const isActive = (path) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Erro ao fazer logout');
      } else {
        toast.success('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };
  
  const navItems = [
    { path: '/', icon: Activity, label: 'Dashboard', color: 'text-blue-600' },
    { path: '/registro', icon: Plus, label: 'Registro', color: 'text-green-600' },
    { path: '/historico', icon: History, label: 'Histórico', color: 'text-purple-600' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios', color: 'text-orange-600' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações', color: 'text-gray-600' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">HGT System</h1>
              <p className="text-xs text-gray-500">Controle Glicêmico</p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex space-x-1">
            {navItems.map(({ path, icon: Icon, label, color }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${isActive(path) 
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive(path) ? 'text-blue-600' : color}`} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* Status Indicator e User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
                
                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Não conectado</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-100">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 4).map(({ path, icon: Icon, label, color }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200
                  ${isActive(path) 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive(path) ? 'text-blue-600' : color}`} />
                <span className="text-xs mt-1 font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
