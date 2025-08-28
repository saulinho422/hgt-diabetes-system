import React from 'react';
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
import AlertPanel from '../components/AlertPanel';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { dashboardData, loading, error } = useDashboardData();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema HGT</h2>
          <p className="text-gray-600 mb-6">Controle completo da sua diabetes</p>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Fazer Login
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              Criar Conta
            </button>
          </div>
        </div>
      </div>
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
