import React from 'react';
import { Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const RecentRecords = ({ records }) => {
  const getGlucoseStatus = (glucose) => {
    if (glucose < 70) return 'low';
    if (glucose > 180) return 'high';
    if (glucose > 300) return 'critical';
    return 'normal';
  };

  const getGlucoseStatusColor = (status) => {
    switch (status) {
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-200 text-red-900 border-red-300 animate-pulse';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getGlucoseStatusText = (status) => {
    switch (status) {
      case 'low':
        return 'Baixa';
      case 'high':
        return 'Alta';
      case 'critical':
        return 'Crítica';
      default:
        return 'Normal';
    }
  };

  const getMealIcon = (meal) => {
    switch (meal.toLowerCase()) {
      case 'café':
      case 'café da manhã':
        return '☕';
      case 'almoço':
        return '🍽️';
      case 'jantar':
        return '🌙';
      case 'deitar':
      case 'ao deitar':
        return '😴';
      default:
        return '🍴';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Registros Recentes
        </h3>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Ver Todos
        </button>
      </div>

      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum registro encontrado</p>
            <p className="text-sm">Adicione seu primeiro registro!</p>
          </div>
        ) : (
          records.map((record, index) => {
            const glucoseStatus = getGlucoseStatus(record.glucose);
            return (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getMealIcon(record.meal)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {record.meal}
                      </span>
                      <span className="text-sm text-gray-500">
                        {record.date}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">Glicose:</span>
                        <span className={`text-sm px-2 py-1 rounded border ${getGlucoseStatusColor(glucoseStatus)}`}>
                          {record.glucose} mg/dL
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">Insulina:</span>
                        <span className="text-sm font-medium text-blue-700">
                          {record.insulin} u
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getGlucoseStatusColor(glucoseStatus)}`}>
                    {getGlucoseStatusText(glucoseStatus)}
                  </span>
                  {glucoseStatus === 'low' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {glucoseStatus === 'high' && <TrendingUp className="h-4 w-4 text-orange-500" />}
                  {glucoseStatus === 'critical' && <TrendingUp className="h-4 w-4 text-red-600" />}
                  {glucoseStatus === 'normal' && <Activity className="h-4 w-4 text-green-500" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {records.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">
                {(records.reduce((sum, record) => sum + record.glucose, 0) / records.length).toFixed(0)}
              </div>
              <div className="text-sm text-blue-600">Média Glicêmica</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-700">
                {records.reduce((sum, record) => sum + record.insulin, 0)}
              </div>
              <div className="text-sm text-green-600">Total Insulina</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentRecords;
