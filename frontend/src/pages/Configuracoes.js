import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Database, 
  Shield,
  Download,
  Upload,
  Trash2,
  Save,
  Target,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Usuário',
      email: 'usuario@email.com',
      dateOfBirth: '',
      diabetesType: 'type1',
      diagnosisDate: '',
      targetGlucose: {
        min: 70,
        max: 180
      }
    },
    notifications: {
      measurementReminders: true,
      highGlucoseAlerts: true,
      lowGlucoseAlerts: true,
      medicationReminders: true,
      weeklyReports: true,
      reminderTimes: {
        breakfast: '07:00',
        lunch: '12:00',
        dinner: '18:00',
        bedtime: '22:00'
      }
    },
    data: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: '2years'
    },
    privacy: {
      shareWithDoctor: false,
      anonymousAnalytics: true,
      dataExport: true
    }
  });

  const tabs = [
    { key: 'profile', label: 'Perfil', icon: User },
    { key: 'notifications', label: 'Notificações', icon: Bell },
    { key: 'data', label: 'Dados', icon: Database },
    { key: 'privacy', label: 'Privacidade', icon: Shield }
  ];

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleNestedSettingChange = (category, parentField, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentField]: {
          ...prev[category][parentField],
          [field]: value
        }
      }
    }));
  };

  const saveSettings = async () => {
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const exportData = () => {
    // Simular exportação
    toast.success('Dados exportados com sucesso!');
  };

  const importData = () => {
    // Simular importação
    toast.success('Dados importados com sucesso!');
  };

  const deleteAllData = () => {
    if (window.confirm('Tem certeza que deseja excluir todos os dados? Esta ação não pode ser desfeita.')) {
      toast.success('Todos os dados foram excluídos');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>
        <button
          onClick={saveSettings}
          className="btn-primary flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Salvar Tudo
        </button>
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
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Nome Completo</label>
                  <input
                    type="text"
                    className="input-field"
                    value={settings.profile.name}
                    onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={settings.profile.email}
                    onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="label">Data de Nascimento</label>
                  <input
                    type="date"
                    className="input-field"
                    value={settings.profile.dateOfBirth}
                    onChange={(e) => handleSettingChange('profile', 'dateOfBirth', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="label">Tipo de Diabetes</label>
                  <select
                    className="input-field"
                    value={settings.profile.diabetesType}
                    onChange={(e) => handleSettingChange('profile', 'diabetesType', e.target.value)}
                  >
                    <option value="type1">Tipo 1</option>
                    <option value="type2">Tipo 2</option>
                    <option value="gestational">Gestacional</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Data do Diagnóstico</label>
                  <input
                    type="date"
                    className="input-field"
                    value={settings.profile.diagnosisDate}
                    onChange={(e) => handleSettingChange('profile', 'diagnosisDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Metas Glicêmicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Glicemia Mínima (mg/dL)</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      className="input-field"
                      value={settings.profile.targetGlucose.min}
                      onChange={(e) => handleNestedSettingChange('profile', 'targetGlucose', 'min', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Glicemia Máxima (mg/dL)</label>
                    <input
                      type="number"
                      min="120"
                      max="250"
                      className="input-field"
                      value={settings.profile.targetGlucose.max}
                      onChange={(e) => handleNestedSettingChange('profile', 'targetGlucose', 'max', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Meta atual: {settings.profile.targetGlucose.min} - {settings.profile.targetGlucose.max} mg/dL
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas e Notificações</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Lembretes de Medição</div>
                      <div className="text-sm text-gray-600">Receba lembretes para medir a glicemia</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.notifications.measurementReminders}
                        onChange={(e) => handleSettingChange('notifications', 'measurementReminders', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Alertas de Hiperglicemia</div>
                      <div className="text-sm text-gray-600">Alertas quando glicemia estiver alta</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.notifications.highGlucoseAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'highGlucoseAlerts', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Alertas de Hipoglicemia</div>
                      <div className="text-sm text-gray-600">Alertas quando glicemia estiver baixa</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.notifications.lowGlucoseAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'lowGlucoseAlerts', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Relatórios Semanais</div>
                      <div className="text-sm text-gray-600">Receba resumos semanais por email</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.notifications.weeklyReports}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Horários dos Lembretes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Café da Manhã</label>
                    <input
                      type="time"
                      className="input-field"
                      value={settings.notifications.reminderTimes.breakfast}
                      onChange={(e) => handleNestedSettingChange('notifications', 'reminderTimes', 'breakfast', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Almoço</label>
                    <input
                      type="time"
                      className="input-field"
                      value={settings.notifications.reminderTimes.lunch}
                      onChange={(e) => handleNestedSettingChange('notifications', 'reminderTimes', 'lunch', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Jantar</label>
                    <input
                      type="time"
                      className="input-field"
                      value={settings.notifications.reminderTimes.dinner}
                      onChange={(e) => handleNestedSettingChange('notifications', 'reminderTimes', 'dinner', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Ao Deitar</label>
                    <input
                      type="time"
                      className="input-field"
                      value={settings.notifications.reminderTimes.bedtime}
                      onChange={(e) => handleNestedSettingChange('notifications', 'reminderTimes', 'bedtime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Backup e Sincronização</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Backup Automático</div>
                      <div className="text-sm text-gray-600">Fazer backup dos dados automaticamente</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.data.autoBackup}
                        onChange={(e) => handleSettingChange('data', 'autoBackup', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Frequência do Backup</label>
                      <select
                        className="input-field"
                        value={settings.data.backupFrequency}
                        onChange={(e) => handleSettingChange('data', 'backupFrequency', e.target.value)}
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Retenção de Dados</label>
                      <select
                        className="input-field"
                        value={settings.data.dataRetention}
                        onChange={(e) => handleSettingChange('data', 'dataRetention', e.target.value)}
                      >
                        <option value="1year">1 ano</option>
                        <option value="2years">2 anos</option>
                        <option value="5years">5 anos</option>
                        <option value="forever">Para sempre</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Gerenciamento de Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={exportData}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Exportar Dados
                  </button>
                  
                  <button
                    onClick={importData}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Importar Dados
                  </button>
                  
                  <button
                    onClick={deleteAllData}
                    className="btn-danger flex items-center justify-center"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Excluir Tudo
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Informações sobre os Dados</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Total de registros: 1.247</p>
                  <p>• Primeiro registro: 28/04/2023</p>
                  <p>• Último backup: Hoje, 14:30</p>
                  <p>• Tamanho dos dados: 2.4 MB</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacidade e Compartilhamento</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Compartilhar com Médico</div>
                      <div className="text-sm text-gray-600">Permitir que seu médico acesse os dados</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.privacy.shareWithDoctor}
                        onChange={(e) => handleSettingChange('privacy', 'shareWithDoctor', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Analytics Anônimos</div>
                      <div className="text-sm text-gray-600">Ajudar a melhorar o sistema com dados anônimos</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.privacy.anonymousAnalytics}
                        onChange={(e) => handleSettingChange('privacy', 'anonymousAnalytics', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Exportação de Dados</div>
                      <div className="text-sm text-gray-600">Permitir exportação completa dos dados</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.privacy.dataExport}
                        onChange={(e) => handleSettingChange('privacy', 'dataExport', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Conformidade e Segurança</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">LGPD Compliant</h4>
                    <p className="text-sm text-green-700">
                      Seus dados são protegidos conforme a Lei Geral de Proteção de Dados.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Criptografia</h4>
                    <p className="text-sm text-blue-700">
                      Todos os dados são criptografados usando AES-256.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Seus Direitos</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• Acessar seus dados a qualquer momento</p>
                  <p>• Solicitar correção de dados incorretos</p>
                  <p>• Solicitar exclusão de todos os dados</p>
                  <p>• Exportar seus dados em formato legível</p>
                  <p>• Revogar consentimentos a qualquer momento</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
