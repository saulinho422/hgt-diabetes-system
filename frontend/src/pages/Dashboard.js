import React, { useState, useEffect } from 'react';
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
import GlucoseChart from '../components/GlucoseChart';
import InsulinChart from '../components/InsulinChart';
import StatsCard from '../components/StatsCard';
import RecentRecords from '../components/RecentRecords';
import AlertPanel from '../components/AlertPanel';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    todayStats: {
      averageGlucose: 0,
      totalInsulin: 0,
      timeInRange: 0,
      lastMeasurement: null
    },
    weeklyTrend: 'stable',
    alerts: [],
    recentRecords: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual API
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Dados de exemplo para demonstração
      setDashboardData({
        todayStats: {
          averageGlucose: 142,
          totalInsulin: 28,
          timeInRange: 78,
          lastMeasurement: { value: 118, time: '14:30', status: 'normal' }
        },
        weeklyTrend: 'improving',
        alerts: [
          { type: 'warning', message: 'Glicemia alta detectada às 19:30 (234 mg/dL)', time: '2 horas atrás' },
          { type: 'info', message: 'Lembrete: Registrar glicemia pós-jantar', time: '30 min atrás' }
        ],
        recentRecords: [
          { date: '27/08', meal: 'Jantar', glucose: 118, insulin: 3, status: 'normal' },
          { date: '27/08', meal: 'Almoço', glucose: 234, insulin: 5, status: 'high' },
          { date: '27/08', meal: 'Café', glucose: 98, insulin: 2, status: 'normal' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          {getTrendIcon(dashboardData.weeklyTrend)}
          <span className={`font-medium ${getTrendColor(dashboardData.weeklyTrend)}`}>
            {getTrendText(dashboardData.weeklyTrend)}
          </span>
        </div>
      </div>

      {/* Alertas */}
      {dashboardData.alerts.length > 0 && (
        <AlertPanel alerts={dashboardData.alerts} />
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Glicemia Média Hoje"
          value={`${dashboardData.todayStats.averageGlucose} mg/dL`}
          icon={Activity}
          trend={dashboardData.todayStats.averageGlucose <= 180 ? 'up' : 'down'}
          color={dashboardData.todayStats.averageGlucose <= 180 ? 'green' : 'red'}
          subtitle="Meta: 70-180 mg/dL"
        />
        
        <StatsCard
          title="Insulina Total Hoje"
          value={`${dashboardData.todayStats.totalInsulin} unidades`}
          icon={Target}
          trend="neutral"
          color="blue"
          subtitle="Distribuída nas refeições"
        />
        
        <StatsCard
          title="Tempo no Alvo"
          value={`${dashboardData.todayStats.timeInRange}%`}
          icon={CheckCircle}
          trend={dashboardData.todayStats.timeInRange >= 70 ? 'up' : 'down'}
          color={dashboardData.todayStats.timeInRange >= 70 ? 'green' : 'orange'}
          subtitle="Meta: >70%"
        />
        
        <StatsCard
          title="Última Medição"
          value={dashboardData.todayStats.lastMeasurement?.value ? 
            `${dashboardData.todayStats.lastMeasurement.value} mg/dL` : 'N/A'}
          icon={Clock}
          trend="neutral"
          color={dashboardData.todayStats.lastMeasurement?.status === 'normal' ? 'green' : 'red'}
          subtitle={dashboardData.todayStats.lastMeasurement?.time || 'Sem registros'}
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
          <RecentRecords records={dashboardData.recentRecords} />
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
