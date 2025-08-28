import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Clock,
  Calendar,
  Target,
  Plus,
  BarChart3,
  History
} from 'lucide-react';
import { useDashboardData } from '../hooks/useSupabaseData';
import { useAuth } from '../hooks/useAuth';
import GlucoseChart from '../components/GlucoseChart';
import InsulinChart from '../components/InsulinChart';
import StatsCard from '../components/StatsCard';
import RecentRecords from '../components/RecentRecords';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';
import AlertPanel from '../components/AlertPanel';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const { dashboardData, loading } = useDashboardData();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Dados padrão caso não esteja autenticado
  const defaultData = {
    todayStats: {
      averageGlucose: 0,
      totalInsulin: 0,
      timeInRange: 0,
      lastMeasurement: null
    },
    weeklyTrend: 'stable',
    alerts: [],
    recentRecords: []
  };

  const currentData = dashboardData || defaultData;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'worsening':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case 'improving':
        return 'Melhorando';
      case 'worsening':
        return 'Necessita atenção';
      default:
        return 'Estável';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'worsening':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  // Se não estiver autenticado, mostrar tela de login/demo
  if (!isAuthenticated) {
    return (
      <>
        {/* Background with floating elements */}
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-40 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>
          </div>
          
          {/* Floating medical icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 opacity-20 animate-float">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform rotate-12">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="absolute top-1/3 right-1/4 opacity-15 animate-float animation-delay-2000">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center transform -rotate-12">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="absolute bottom-1/3 left-1/3 opacity-10 animate-float animation-delay-4000">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center transform rotate-45">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Main card */}
          <div className="relative z-10 max-w-md mx-auto animate-slide-up">
            <div 
              className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(59, 130, 246, 0.15)'
              }}
            >
              {/* Floating badge */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                  Sistema Médico Avançado
                </div>
              </div>

              {/* Icon with glow effect */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 transform hover:rotate-6 transition-all duration-500 animate-pulse-glow">
                    <Activity className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
                </div>
              </div>

              {/* Title with gradient text */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                  Sistema HGT
                </h2>
                <p className="text-gray-600 font-medium animate-fade-in">
                  Controle completo da sua diabetes
                </p>
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500">Sistema Ativo</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-4">
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    <span>Fazer Login</span>
                    <div className="ml-2 transform group-hover:translate-x-1 transition-transform">→</div>
                  </div>
                  <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
                </button>
                
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-300 group"
                >
                  <div className="relative flex items-center justify-center">
                    <span>Criar Conta</span>
                    <div className="ml-2 transform group-hover:translate-x-1 transition-transform">✨</div>
                  </div>
                </button>
              </div>

              {/* Features preview */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 transform group-hover:scale-110 transition-transform">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Monitoramento</p>
                  </div>
                  <div className="group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2 transform group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Relatórios</p>
                  </div>
                  <div className="group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-2 transform group-hover:scale-110 transition-transform">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Metas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modais de Autenticação */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
        <RegisterModal 
          isOpen={showRegisterModal} 
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard HGT</h1>
          <p className="text-gray-600 mt-1">
            Análise completa do seu controle glicêmico
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-md">
          {getTrendIcon(currentData.weeklyTrend)}
          <span className={`font-medium ${getTrendColor(currentData.weeklyTrend)}`}>
            {getTrendText(currentData.weeklyTrend)}
          </span>
        </div>
      </div>

      {/* Alertas */}
      {currentData.alerts.length > 0 && (
        <AlertPanel alerts={currentData.alerts} />
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Glicemia Média Hoje"
          value={`${currentData.todayStats.averageGlucose} mg/dL`}
          icon={Activity}
          trend={currentData.todayStats.averageGlucose <= 180 ? 'up' : 'down'}
          color={currentData.todayStats.averageGlucose <= 180 ? 'green' : 'red'}
          subtitle="Meta: 70-180 mg/dL"
        />
        
        <StatsCard
          title="Insulina Total Hoje"
          value={`${currentData.todayStats.totalInsulin} unidades`}
          icon={Target}
          trend="neutral"
          color="blue"
          subtitle="Distribuída nas refeições"
        />
        
        <StatsCard
          title="Tempo no Alvo"
          value={`${currentData.todayStats.timeInRange}%`}
          icon={CheckCircle}
          trend={currentData.todayStats.timeInRange >= 70 ? 'up' : 'down'}
          color={currentData.todayStats.timeInRange >= 70 ? 'green' : 'orange'}
          subtitle="Meta: >70%"
        />
        
        <StatsCard
          title="Última Medição"
          value={currentData.todayStats.lastMeasurement?.value ? 
            `${currentData.todayStats.lastMeasurement.value} mg/dL` : 'N/A'}
          icon={Clock}
          trend="neutral"
          color={currentData.todayStats.lastMeasurement?.status === 'normal' ? 'green' : 'red'}
          subtitle={currentData.todayStats.lastMeasurement?.time || 'Sem registros'}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Evolução Glicêmica (7 dias)
          </h3>
          <GlucoseChart />
        </div>
        
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Aplicação de Insulina (7 dias)
          </h3>
          <InsulinChart />
        </div>
      </div>

      {/* Registros Recentes e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registros Recentes */}
        <div className="lg:col-span-2">
          <RecentRecords records={currentData.recentRecords} />
        </div>
        
        {/* Análise Rápida */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Análise Rápida
          </h3>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Padrão Identificado</h4>
              <p className="text-sm text-blue-600 mt-1">
                Glicemia tende a subir após almoço. Considere ajuste na insulina.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Ponto Positivo</h4>
              <p className="text-sm text-green-600 mt-1">
                Controle matinal excelente nas últimas 3 semanas.
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800">Recomendação</h4>
              <p className="text-sm text-yellow-600 mt-1">
                Agendar consulta médica para revisar doses de insulina.
              </p>
            </div>
          </div>
          
          <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            Ver Análise Completa
          </button>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Plus className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-700">Novo Registro</span>
            </div>
          </button>
          
          <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-700">Ver Relatórios</span>
            </div>
          </button>
          
          <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <History className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-700">Histórico</span>
            </div>
          </button>
          
          <button className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors duration-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-700">Alertas</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
