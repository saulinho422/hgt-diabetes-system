import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Calendar,
  Activity,
  Target
} from 'lucide-react';

const Historico = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    start: '',
    end: ''
  });
  const [glucoseFilter, setGlucoseFilter] = useState('all');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, dateFilter, glucoseFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual API
      const response = await fetch('/api/records');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      // Dados de exemplo para demonstração
      setRecords([
        {
          id: 1,
          data: '27/08/2024',
          cafe_hora: '06:22',
          cafe_glicose_antes: 142,
          cafe_glicose_2h: null,
          cafe_insulina_total: 2,
          almoco_hora: '11:56',
          almoco_glicose_antes: 78,
          almoco_glicose_2h: null,
          almoco_insulina_total: 1,
          jantar_hora: '18:15',
          jantar_glicose_antes: 113,
          jantar_glicose_2h: null,
          jantar_insulina_total: 2,
          deitar_hora: '21:40',
          deitar_glicose: 92,
          deitar_insulina: 1,
          total_insulina_dia: 6
        },
        {
          id: 2,
          data: '26/08/2024',
          cafe_hora: '06:56',
          cafe_glicose_antes: 74,
          cafe_glicose_2h: null,
          cafe_insulina_total: 1,
          almoco_hora: '12:37',
          almoco_glicose_antes: 121,
          almoco_glicose_2h: null,
          almoco_insulina_total: 2,
          jantar_hora: '18:18',
          jantar_glicose_antes: 130,
          jantar_glicose_2h: null,
          jantar_insulina_total: 2,
          deitar_hora: null,
          deitar_glicose: null,
          deitar_insulina: null,
          total_insulina_dia: 5
        },
        // Mais registros de exemplo...
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.data.includes(searchTerm)
      );
    }

    // Filtro por data
    if (dateFilter.start && dateFilter.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.data.split('/').reverse().join('-'));
        const startDate = new Date(dateFilter.start);
        const endDate = new Date(dateFilter.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // Filtro por glicose
    if (glucoseFilter !== 'all') {
      filtered = filtered.filter(record => {
        const glucoseValues = [
          record.cafe_glicose_antes,
          record.almoco_glicose_antes,
          record.jantar_glicose_antes,
          record.deitar_glicose
        ].filter(val => val !== null && val !== undefined);

        const hasLow = glucoseValues.some(val => val < 70);
        const hasHigh = glucoseValues.some(val => val > 180);
        const hasNormal = glucoseValues.some(val => val >= 70 && val <= 180);

        switch (glucoseFilter) {
          case 'low':
            return hasLow;
          case 'high':
            return hasHigh;
          case 'normal':
            return hasNormal && !hasLow && !hasHigh;
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
  };

  const getGlucoseStatus = (glucose) => {
    if (!glucose) return 'none';
    if (glucose < 70) return 'low';
    if (glucose > 180) return 'high';
    return 'normal';
  };

  const getGlucoseStatusColor = (status) => {
    switch (status) {
      case 'low':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const exportData = () => {
    // Implementar exportação CSV/PDF
    console.log('Exportando dados...');
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
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Registros</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todos os seus registros glicêmicos
          </p>
        </div>
        <button
          onClick={exportData}
          className="btn-primary flex items-center"
        >
          <Download className="h-5 w-5 mr-2" />
          Exportar
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="label">Buscar por Data</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="label">Data Início</label>
            <input
              type="date"
              className="input-field"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Data Fim</label>
            <input
              type="date"
              className="input-field"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>

          {/* Glucose Filter */}
          <div>
            <label className="label">Filtrar por Glicose</label>
            <select
              className="input-field"
              value={glucoseFilter}
              onChange={(e) => setGlucoseFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="low">Baixa (&lt; 70)</option>
              <option value="normal">Normal (70-180)</option>
              <option value="high">Alta (&gt; 180)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {filteredRecords.length} de {records.length} registros
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFilter({ start: '', end: '' });
              setGlucoseFilter('all');
            }}
            className="btn-secondary text-sm"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Café da Manhã
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Almoço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jantar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ao Deitar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Insulina
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {record.data}
                      </span>
                    </div>
                  </td>

                  {/* Café da Manhã */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {record.cafe_hora && (
                        <>
                          <div className="text-gray-500">{record.cafe_hora}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            {record.cafe_glicose_antes && (
                              <span className={`text-xs px-2 py-1 rounded ${getGlucoseStatusColor(getGlucoseStatus(record.cafe_glicose_antes))}`}>
                                {record.cafe_glicose_antes} mg/dL
                              </span>
                            )}
                            <span className="text-xs text-blue-600">
                              {record.cafe_insulina_total}u
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Almoço */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {record.almoco_hora && (
                        <>
                          <div className="text-gray-500">{record.almoco_hora}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            {record.almoco_glicose_antes && (
                              <span className={`text-xs px-2 py-1 rounded ${getGlucoseStatusColor(getGlucoseStatus(record.almoco_glicose_antes))}`}>
                                {record.almoco_glicose_antes} mg/dL
                              </span>
                            )}
                            <span className="text-xs text-blue-600">
                              {record.almoco_insulina_total}u
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Jantar */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {record.jantar_hora && (
                        <>
                          <div className="text-gray-500">{record.jantar_hora}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            {record.jantar_glicose_antes && (
                              <span className={`text-xs px-2 py-1 rounded ${getGlucoseStatusColor(getGlucoseStatus(record.jantar_glicose_antes))}`}>
                                {record.jantar_glicose_antes} mg/dL
                              </span>
                            )}
                            <span className="text-xs text-blue-600">
                              {record.jantar_insulina_total}u
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Ao Deitar */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {record.deitar_hora && (
                        <>
                          <div className="text-gray-500">{record.deitar_hora}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            {record.deitar_glicose && (
                              <span className={`text-xs px-2 py-1 rounded ${getGlucoseStatusColor(getGlucoseStatus(record.deitar_glicose))}`}>
                                {record.deitar_glicose} mg/dL
                              </span>
                            )}
                            {record.deitar_insulina && (
                              <span className="text-xs text-blue-600">
                                {record.deitar_insulina}u
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Total Insulina */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-semibold text-blue-700">
                        {record.total_insulina_dia} u
                      </span>
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
            <p className="text-sm text-gray-500">
              Tente ajustar os filtros ou adicione novos registros.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredRecords.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Registros por página:</span>
              <select className="input-field w-20">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-secondary">Anterior</button>
              <span className="text-sm text-gray-700">1 de 1</span>
              <button className="btn-secondary">Próximo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historico;
