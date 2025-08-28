import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  Download,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import DetailedGlucoseChart from '../components/DetailedGlucoseChart';
import InsulinEffectivenessChart from '../components/InsulinEffectivenessChart';
import TimeInRangeChart from '../components/TimeInRangeChart';
import PatternAnalysis from '../components/PatternAnalysis';

const Relatorios = () => {
  const [reportData, setReportData] = useState({
    period: 'last30days',
    stats: {
      averageGlucose: 0,
      timeInRange: 0,
      glucoseVariability: 0,
      totalInsulin: 0,
      hypoEpisodes: 0,
      hyperEpisodes: 0,
      estimatedHbA1c: 0
    },
    trends: {},
    patterns: []
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData(selectedPeriod);
  }, [selectedPeriod]);

  const fetchReportData = async (period) => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual API
      const response = await fetch(`/api/reports?period=${period}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      // Dados de exemplo para demonstração
      setReportData({
        period: period,
        stats: {
          averageGlucose: 142,
          timeInRange: 78,
          glucoseVariability: 23,
          totalInsulin: 840,
          hypoEpisodes: 3,
          hyperEpisodes: 12,
          estimatedHbA1c: 6.8
        },
        trends: {
          glucose: 'improving',
          insulin: 'stable',
          timeInRange: 'improving'
        },
        patterns: [
          {
            type: 'post_meal_spike',
            meal: 'almoço',
            frequency: 70,
            description: 'Picos glicêmicos frequentes após almoço'
          },
          {
            type: 'dawn_phenomenon',
            frequency: 40,
            description: 'Fenômeno do amanhecer ocasional'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'last90days', label: 'Últimos 90 dias' },
    { value: 'last6months', label: 'Últimos 6 meses' },
    { value: 'lastyear', label: 'Último ano' }
  ];

  const tabs = [
    { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { key: 'glucose', label: 'Análise Glicêmica', icon: Activity },
    { key: 'insulin', label: 'Eficácia da Insulina', icon: Target },
    { key: 'patterns', label: 'Padrões e Tendências', icon: TrendingUp }
  ];

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.good) return 'text-green-600 bg-green-50';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value >= thresholds.good) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (value >= thresholds.warning) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const exportReport = () => {
    // Implementar exportação de relatório
    console.log('Exportando relatório...');
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
          <h1 className="text-3xl font-bold text-gray-900">Relatórios e Análises</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada do seu controle glicêmico
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-48"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <button
            onClick={exportReport}
            className="btn-primary flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(reportData.stats.timeInRange, { good: 70, warning: 50 })}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {reportData.stats.timeInRange}%
          </div>
          <div className="text-sm text-gray-600">Tempo no Alvo</div>
          <div className="text-xs text-gray-500 mt-1">Meta: &gt;70%</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(180 - reportData.stats.averageGlucose + 70, { good: 70, warning: 50 })}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {reportData.stats.averageGlucose} mg/dL
          </div>
          <div className="text-sm text-gray-600">Glicemia Média</div>
          <div className="text-xs text-gray-500 mt-1">Meta: 70-180 mg/dL</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(100 - reportData.stats.glucoseVariability, { good: 70, warning: 50 })}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {reportData.stats.glucoseVariability}%
          </div>
          <div className="text-sm text-gray-600">Variabilidade</div>
          <div className="text-xs text-gray-500 mt-1">Meta: &lt;30%</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {reportData.stats.estimatedHbA1c}%
          </div>
          <div className="text-sm text-gray-600">HbA1c Estimada</div>
          <div className="text-xs text-gray-500 mt-1">Meta: &lt;7%</div>
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {30 - reportData.stats.hypoEpisodes - reportData.stats.hyperEpisodes}
              </div>
              <div className="text-sm text-gray-600">Dias sem Alertas</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {reportData.stats.hypoEpisodes}
              </div>
              <div className="text-sm text-gray-600">Episódios de Hipoglicemia</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {reportData.stats.hyperEpisodes}
              </div>
              <div className="text-sm text-gray-600">Episódios de Hiperglicemia</div>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === key 
                    ? 'text-blue-500' 
                    : 'text-gray-400 group-hover:text-gray-500'
                  }
                `} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Distribuição do Tempo no Alvo
                  </h3>
                  <TimeInRangeChart />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Resumo Semanal
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">Controle Geral</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        Bom controle glicêmico na maioria dos dias. Continue assim!
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800">Ponto de Atenção</h4>
                      <p className="text-sm text-yellow-600 mt-1">
                        Variabilidade um pouco alta nos fins de semana.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">Progresso</h4>
                      <p className="text-sm text-green-600 mt-1">
                        Melhora de 5% no tempo em range comparado ao mês anterior.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'glucose' && (
            <div className="space-y-6">
              <DetailedGlucoseChart period={selectedPeriod} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Estatísticas Glicêmicas</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Média Geral:</span>
                      <span className="font-medium">{reportData.stats.averageGlucose} mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Desvio Padrão:</span>
                      <span className="font-medium">{reportData.stats.glucoseVariability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo &lt; 70 mg/dL:</span>
                      <span className="font-medium text-red-600">4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo 70-180 mg/dL:</span>
                      <span className="font-medium text-green-600">{reportData.stats.timeInRange}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo &gt; 180 mg/dL:</span>
                      <span className="font-medium text-orange-600">{100 - reportData.stats.timeInRange - 4}%</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Por Período do Dia</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manhã (6h-12h):</span>
                      <span className="font-medium">128 mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarde (12h-18h):</span>
                      <span className="font-medium">156 mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Noite (18h-24h):</span>
                      <span className="font-medium">142 mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Madrugada (0h-6h):</span>
                      <span className="font-medium">118 mg/dL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insulin' && (
            <div className="space-y-6">
              <InsulinEffectivenessChart period={selectedPeriod} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-4">Insulina Total</h4>
                  <div className="text-2xl font-bold text-blue-700 mb-2">
                    {reportData.stats.totalInsulin} u
                  </div>
                  <div className="text-sm text-blue-600">
                    Média: {(reportData.stats.totalInsulin / 30).toFixed(1)} u/dia
                  </div>
                </div>
                <div className="p-6 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-4">Eficácia</h4>
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    85%
                  </div>
                  <div className="text-sm text-green-600">
                    Doses dentro do range esperado
                  </div>
                </div>
                <div className="p-6 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-4">Ajustes Sugeridos</h4>
                  <div className="text-2xl font-bold text-orange-700 mb-2">
                    3
                  </div>
                  <div className="text-sm text-orange-600">
                    Oportunidades de otimização
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-6">
              <PatternAnalysis patterns={reportData.patterns} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Tendências Identificadas</h4>
                  <div className="space-y-4">
                    {reportData.patterns.map((pattern, index) => (
                      <div key={index} className="p-3 bg-white rounded border-l-4 border-blue-500">
                        <div className="font-medium text-gray-800">
                          {pattern.description}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Frequência: {pattern.frequency}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Recomendações</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-green-800">Consulta Médica</div>
                      <div className="text-sm text-green-600 mt-1">
                        Agende consulta para revisar doses de insulina do almoço
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-800">Monitoramento</div>
                      <div className="text-sm text-blue-600 mt-1">
                        Continue medindo glicemia 2h após refeições
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="font-medium text-yellow-800">Atividade Física</div>
                      <div className="text-sm text-yellow-600 mt-1">
                        Considere exercícios leves após almoço
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
