import React from 'react';
import { History, Calendar, TrendingUp, Filter } from 'lucide-react';

const Historico = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl">
            <History className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico</h1>
            <p className="text-gray-600 mt-1">Visualize seu histórico de glicemia e insulina</p>
          </div>
        </div>
      </div>

      {/* Em desenvolvimento */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <History className="h-12 w-12 text-purple-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Página de Histórico em Desenvolvimento
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Esta página exibirá seu histórico completo de registros de glicemia, insulina e outros dados de saúde.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-purple-50 p-4 rounded-xl">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Filtros por Data</h3>
            <p className="text-sm text-gray-600">Visualize registros por períodos específicos</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-xl">
            <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Análise de Tendências</h3>
            <p className="text-sm text-gray-600">Identifique padrões em seus dados</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl">
            <Filter className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Filtros Avançados</h3>
            <p className="text-sm text-gray-600">Filtre por tipo, horário e outros critérios</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historico;
