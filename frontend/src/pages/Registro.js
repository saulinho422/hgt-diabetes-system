import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  Clock, 
  Activity, 
  Target,
  Coffee,
  Sun,
  Moon,
  Bed
} from 'lucide-react';

const Registro = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('cafe');
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      data: selectedDate,
      cafe_hora: '',
      cafe_glicose_antes: '',
      cafe_glicose_2h: '',
      cafe_insulina_aferida: '',
      cafe_insulina_refeicao: '',
      almoco_hora: '',
      almoco_glicose_antes: '',
      almoco_glicose_2h: '',
      almoco_insulina_aferida: '',
      almoco_insulina_refeicao: '',
      jantar_hora: '',
      jantar_glicose_antes: '',
      jantar_glicose_2h: '',
      jantar_insulina_aferida: '',
      jantar_insulina_refeicao: '',
      deitar_hora: '',
      deitar_glicose: '',
      madrugada_glicose: '',
      deitar_insulina: ''
    }
  });

  const watchedValues = watch();

  const calculateInsulinTotal = (aferida, refeicao) => {
    const aferidaNum = parseFloat(aferida) || 0;
    const refeicaoNum = parseFloat(refeicao) || 0;
    return aferidaNum + refeicaoNum;
  };

  const calculateDayTotal = () => {
    const cafeTotal = calculateInsulinTotal(watchedValues.cafe_insulina_aferida, watchedValues.cafe_insulina_refeicao);
    const almocoTotal = calculateInsulinTotal(watchedValues.almoco_insulina_aferida, watchedValues.almoco_insulina_refeicao);
    const jantarTotal = calculateInsulinTotal(watchedValues.jantar_insulina_aferida, watchedValues.jantar_insulina_refeicao);
    const deitarTotal = parseFloat(watchedValues.deitar_insulina) || 0;
    
    return cafeTotal + almocoTotal + jantarTotal + deitarTotal;
  };

  const onSubmit = async (data) => {
    try {
      // Calcular totais
      data.cafe_insulina_total = calculateInsulinTotal(data.cafe_insulina_aferida, data.cafe_insulina_refeicao);
      data.almoco_insulina_total = calculateInsulinTotal(data.almoco_insulina_aferida, data.almoco_insulina_refeicao);
      data.jantar_insulina_total = calculateInsulinTotal(data.jantar_insulina_aferida, data.jantar_insulina_refeicao);
      data.total_insulina_dia = calculateDayTotal();

      // Simular chamada da API
      console.log('Dados do registro:', data);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Registro salvo com sucesso!');
      
      // Reset form ou redirecionar
      // reset();
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      toast.error('Erro ao salvar registro. Tente novamente.');
    }
  };

  const tabs = [
    { key: 'cafe', label: 'Café da Manhã', icon: Coffee, color: 'blue' },
    { key: 'almoco', label: 'Almoço', icon: Sun, color: 'green' },
    { key: 'jantar', label: 'Jantar', icon: Moon, color: 'orange' },
    { key: 'deitar', label: 'Ao Deitar', icon: Bed, color: 'purple' }
  ];

  const renderMealForm = (prefix, mealName) => {
    const isDeitar = prefix === 'deitar';
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Horário */}
          <div>
            <label className="label">
              <Clock className="h-4 w-4 inline mr-1" />
              Horário
            </label>
            <input
              type="time"
              className="input-field"
              {...register(`${prefix}_hora`)}
            />
          </div>

          {/* Glicose */}
          {!isDeitar ? (
            <>
              <div>
                <label className="label">
                  <Activity className="h-4 w-4 inline mr-1" />
                  Glicose Antes (mg/dL)
                </label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  className="input-field"
                  placeholder="Ex: 120"
                  {...register(`${prefix}_glicose_antes`, {
                    min: { value: 20, message: 'Valor mínimo: 20 mg/dL' },
                    max: { value: 600, message: 'Valor máximo: 600 mg/dL' }
                  })}
                />
                {errors[`${prefix}_glicose_antes`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_glicose_antes`].message}</p>
                )}
              </div>
              
              <div>
                <label className="label">
                  <Activity className="h-4 w-4 inline mr-1" />
                  Glicose 2h Após (mg/dL)
                </label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  className="input-field"
                  placeholder="Ex: 140"
                  {...register(`${prefix}_glicose_2h`, {
                    min: { value: 20, message: 'Valor mínimo: 20 mg/dL' },
                    max: { value: 600, message: 'Valor máximo: 600 mg/dL' }
                  })}
                />
                {errors[`${prefix}_glicose_2h`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_glicose_2h`].message}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label">
                  <Activity className="h-4 w-4 inline mr-1" />
                  Glicose ao Deitar (mg/dL)
                </label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  className="input-field"
                  placeholder="Ex: 120"
                  {...register(`${prefix}_glicose`, {
                    min: { value: 20, message: 'Valor mínimo: 20 mg/dL' },
                    max: { value: 600, message: 'Valor máximo: 600 mg/dL' }
                  })}
                />
                {errors[`${prefix}_glicose`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_glicose`].message}</p>
                )}
              </div>
              
              <div>
                <label className="label">
                  <Activity className="h-4 w-4 inline mr-1" />
                  Glicose Madrugada (mg/dL)
                </label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  className="input-field"
                  placeholder="Ex: 110"
                  {...register(`madrugada_glicose`, {
                    min: { value: 20, message: 'Valor mínimo: 20 mg/dL' },
                    max: { value: 600, message: 'Valor máximo: 600 mg/dL' }
                  })}
                />
                {errors.madrugada_glicose && (
                  <p className="text-red-500 text-sm mt-1">{errors.madrugada_glicose.message}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Insulina */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isDeitar ? (
            <>
              <div>
                <label className="label">
                  <Target className="h-4 w-4 inline mr-1" />
                  Insulina Aferida (unidades)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="input-field"
                  placeholder="Ex: 2"
                  {...register(`${prefix}_insulina_aferida`, {
                    min: { value: 0, message: 'Valor mínimo: 0' }
                  })}
                />
                {errors[`${prefix}_insulina_aferida`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_insulina_aferida`].message}</p>
                )}
              </div>
              
              <div>
                <label className="label">
                  <Target className="h-4 w-4 inline mr-1" />
                  Insulina Refeição (unidades)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="input-field"
                  placeholder="Ex: 8"
                  {...register(`${prefix}_insulina_refeicao`, {
                    min: { value: 0, message: 'Valor mínimo: 0' }
                  })}
                />
                {errors[`${prefix}_insulina_refeicao`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_insulina_refeicao`].message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Total (calculado)</label>
                <div className="input-field bg-gray-50 flex items-center">
                  <span className="font-semibold text-blue-600">
                    {calculateInsulinTotal(
                      watchedValues[`${prefix}_insulina_aferida`], 
                      watchedValues[`${prefix}_insulina_refeicao`]
                    ).toFixed(1)} u
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="label">
                <Target className="h-4 w-4 inline mr-1" />
                Insulina (unidades)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="input-field"
                placeholder="Ex: 3"
                {...register(`${prefix}_insulina`, {
                  min: { value: 0, message: 'Valor mínimo: 0' }
                })}
              />
              {errors[`${prefix}_insulina`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`${prefix}_insulina`].message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Registro</h1>
            <p className="text-gray-600 mt-1">
              Registre seus dados glicêmicos e aplicação de insulina
            </p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">
              Total do Dia: {calculateDayTotal().toFixed(1)} unidades
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Seletor de Data */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="label">Data do Registro</label>
              <input
                type="date"
                className="input-field"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                {...register('data', { required: 'Data é obrigatória' })}
              />
              {errors.data && (
                <p className="text-red-500 text-sm mt-1">{errors.data.message}</p>
              )}
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setSelectedDate(today);
                }}
                className="btn-secondary"
              >
                Hoje
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`
                    group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === key
                      ? `border-${color}-500 text-${color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === key 
                      ? `text-${color}-500` 
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Form Content */}
          <div className="min-h-[400px]">
            {activeTab === 'cafe' && renderMealForm('cafe', 'Café da Manhã')}
            {activeTab === 'almoco' && renderMealForm('almoco', 'Almoço')}
            {activeTab === 'jantar' && renderMealForm('jantar', 'Jantar')}
            {activeTab === 'deitar' && renderMealForm('deitar', 'Ao Deitar')}
          </div>
        </div>

        {/* Summary & Actions */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo do Dia</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">
                    {calculateInsulinTotal(watchedValues.cafe_insulina_aferida, watchedValues.cafe_insulina_refeicao).toFixed(1)}
                  </div>
                  <div className="text-sm text-blue-600">Café</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-700">
                    {calculateInsulinTotal(watchedValues.almoco_insulina_aferida, watchedValues.almoco_insulina_refeicao).toFixed(1)}
                  </div>
                  <div className="text-sm text-green-600">Almoço</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-700">
                    {calculateInsulinTotal(watchedValues.jantar_insulina_aferida, watchedValues.jantar_insulina_refeicao).toFixed(1)}
                  </div>
                  <div className="text-sm text-orange-600">Jantar</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-700">
                    {(parseFloat(watchedValues.deitar_insulina) || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-purple-600">Deitar</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center space-y-3">
              <button
                type="submit"
                className="btn-primary flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Salvar Registro
              </button>
              <button
                type="button"
                onClick={() => reset()}
                className="btn-secondary"
              >
                Limpar Formulário
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Registro;
