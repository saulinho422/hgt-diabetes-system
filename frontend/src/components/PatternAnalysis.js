import React from 'react';
import { TrendingUp, AlertTriangle, Clock, Target } from 'lucide-react';

const PatternAnalysis = ({ patterns }) => {
  const getPatternIcon = (type) => {
    switch (type) {
      case 'post_meal_spike':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'dawn_phenomenon':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'hypoglycemia_risk':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPatternColor = (type) => {
    switch (type) {
      case 'post_meal_spike':
        return 'border-orange-200 bg-orange-50';
      case 'dawn_phenomenon':
        return 'border-blue-200 bg-blue-50';
      case 'hypoglycemia_risk':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getFrequencyColor = (frequency) => {
    if (frequency >= 70) return 'text-red-600 bg-red-100';
    if (frequency >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const weeklyPatterns = [
    {
      day: 'Segunda',
      morning: { avg: 118, status: 'normal' },
      afternoon: { avg: 156, status: 'high' },
      evening: { avg: 142, status: 'normal' }
    },
    {
      day: 'Terça',
      morning: { avg: 92, status: 'normal' },
      afternoon: { avg: 134, status: 'normal' },
      evening: { avg: 128, status: 'normal' }
    },
    {
      day: 'Quarta',
      morning: { avg: 108, status: 'normal' },
      afternoon: { avg: 178, status: 'high' },
      evening: { avg: 165, status: 'normal' }
    },
    {
      day: 'Quinta',
      morning: { avg: 95, status: 'normal' },
      afternoon: { avg: 145, status: 'normal' },
      evening: { avg: 132, status: 'normal' }
    },
    {
      day: 'Sexta',
      morning: { avg: 115, status: 'normal' },
      afternoon: { avg: 168, status: 'normal' },
      evening: { avg: 158, status: 'normal' }
    },
    {
      day: 'Sábado',
      morning: { avg: 132, status: 'normal' },
      afternoon: { avg: 189, status: 'high' },
      evening: { avg: 172, status: 'normal' }
    },
    {
      day: 'Domingo',
      morning: { avg: 125, status: 'normal' },
      afternoon: { avg: 195, status: 'high' },
      evening: { avg: 168, status: 'normal' }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'low':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Padrões Identificados */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Padrões Identificados</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${getPatternColor(pattern.type)}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getPatternIcon(pattern.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-800">
                      {pattern.meal ? `Pico pós ${pattern.meal}` : 'Fenômeno do Amanhecer'}
                    </h5>
                    <span className={`text-xs px-2 py-1 rounded-full ${getFrequencyColor(pattern.frequency)}`}>
                      {pattern.frequency}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{pattern.description}</p>
                  
                  {pattern.type === 'post_meal_spike' && (
                    <div className="mt-3 p-2 bg-white rounded border">
                      <div className="text-xs text-gray-500 mb-1">Recomendação:</div>
                      <div className="text-xs text-gray-700">
                        • Aumentar insulina pré-refeição em 1-2 unidades<br/>
                        • Considerar exercício leve 30min após refeição<br/>
                        • Revisar composição da refeição
                      </div>
                    </div>
                  )}
                  
                  {pattern.type === 'dawn_phenomenon' && (
                    <div className="mt-3 p-2 bg-white rounded border">
                      <div className="text-xs text-gray-500 mb-1">Recomendação:</div>
                      <div className="text-xs text-gray-700">
                        • Monitorar glicemia ao acordar<br/>
                        • Considerar ajuste da insulina basal<br/>
                        • Consultar endocrinologista
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Padrão Semanal */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Padrão Semanal de Glicemia</h4>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
              <div>Dia da Semana</div>
              <div className="text-center">Manhã</div>
              <div className="text-center">Tarde</div>
              <div className="text-center">Noite</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {weeklyPatterns.map((day, index) => (
              <div key={index} className="px-6 py-4">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-gray-900">{day.day}</div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm">{day.morning.avg} mg/dL</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(day.morning.status)}`}></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm">{day.afternoon.avg} mg/dL</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(day.afternoon.status)}`}></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm">{day.evening.avg} mg/dL</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(day.evening.status)}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Normal (70-180 mg/dL)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>Alto ({'>'} 180 mg/dL)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Baixo ({'<'} 70 mg/dL)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Baseados em IA */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Insights Inteligentes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Melhor Horário para Exercícios</h5>
                <p className="text-sm text-blue-700">
                  Baseado nos seus padrões, exercícios entre 14h-15h podem ajudar a reduzir 
                  os picos pós-almoço em 15-20%.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h5 className="font-medium text-green-800 mb-1">Progresso Detectado</h5>
                <p className="text-sm text-green-700">
                  Seus valores matinais melhoraram 12% nas últimas 3 semanas. 
                  Continue com a rotina atual!
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h5 className="font-medium text-orange-800 mb-1">Padrão de Fim de Semana</h5>
                <p className="text-sm text-orange-700">
                  Glicemia 18% mais alta nos fins de semana. Considere manter 
                  horários regulares de refeição.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h5 className="font-medium text-purple-800 mb-1">Próxima Consulta</h5>
                <p className="text-sm text-purple-700">
                  Com base nos padrões atuais, recomendamos consulta médica 
                  para revisar doses em 2-3 semanas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternAnalysis;
