import { useState, useEffect, useCallback } from 'react';
import { supabaseHelpers } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useGlucoseRecords = (filters = {}) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabaseHelpers.getGlucoseRecords(user.id, filters);
      
      if (error) throw error;
      
      setRecords(data || []);
    } catch (err) {
      console.error('Erro ao buscar registros de glicemia:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const addRecord = async (recordData) => {
    if (!user) return { error: 'Usuário não autenticado' };
    
    try {
      const { data, error } = await supabaseHelpers.createGlucoseRecord({
        user_id: user.id,
        ...recordData
      });
      
      if (error) throw error;
      
      // Atualizar lista local
      setRecords(prev => [data[0], ...prev]);
      
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao adicionar registro:', err);
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    addRecord,
    refetch: fetchRecords
  };
};

export const useInsulinRecords = (filters = {}) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabaseHelpers.getInsulinRecords(user.id, filters);
      
      if (error) throw error;
      
      setRecords(data || []);
    } catch (err) {
      console.error('Erro ao buscar registros de insulina:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const addRecord = async (recordData) => {
    if (!user) return { error: 'Usuário não autenticado' };
    
    try {
      const { data, error } = await supabaseHelpers.createInsulinRecord({
        user_id: user.id,
        ...recordData
      });
      
      if (error) throw error;
      
      // Atualizar lista local
      setRecords(prev => [data[0], ...prev]);
      
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao adicionar registro:', err);
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    addRecord,
    refetch: fetchRecords
  };
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabaseHelpers.getUserSettings(user.id);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
        throw error;
      }
      
      setSettings(data);
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateSettings = async (newSettings) => {
    if (!user) return { error: 'Usuário não autenticado' };
    
    try {
      const { data, error } = await supabaseHelpers.updateUserSettings(user.id, newSettings);
      
      if (error) throw error;
      
      setSettings(data[0]);
      
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
};

export const useAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabaseHelpers.getAlerts(user.id);
      
      if (error) throw error;
      
      setAlerts(data || []);
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (alertId) => {
    try {
      const { error } = await supabaseHelpers.markAlertAsRead(alertId);
      
      if (error) throw error;
      
      // Atualizar estado local
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
      
      return { error: null };
    } catch (err) {
      console.error('Erro ao marcar alerta como lido:', err);
      return { error: err };
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    markAsRead,
    refetch: fetchAlerts,
    unreadCount: alerts.filter(alert => !alert.read).length
  };
};

// Hook combinado para dashboard
export const useDashboardData = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Buscar dados em paralelo
      const [glucoseResponse, insulinResponse, alertsResponse] = await Promise.all([
        supabaseHelpers.getGlucoseRecords(user.id, { startDate: lastWeek }),
        supabaseHelpers.getInsulinRecords(user.id, { startDate: lastWeek }),
        supabaseHelpers.getAlerts(user.id)
      ]);
      
      if (glucoseResponse.error) throw glucoseResponse.error;
      if (insulinResponse.error) throw insulinResponse.error;
      if (alertsResponse.error) throw alertsResponse.error;
      
      const glucoseRecords = glucoseResponse.data || [];
      const insulinRecords = insulinResponse.data || [];
      const alerts = alertsResponse.data || [];
      
      // Calcular estatísticas
      const todayGlucose = glucoseRecords.filter(record => record.date === today);
      const averageGlucose = glucoseRecords.length > 0 
        ? glucoseRecords.reduce((sum, record) => sum + record.glucose_value, 0) / glucoseRecords.length
        : 0;
      
      const todayInsulin = insulinRecords.filter(record => record.date === today);
      const totalInsulinToday = todayInsulin.reduce((sum, record) => sum + parseFloat(record.units), 0);
      
      setDashboardData({
        todayStats: {
          glucoseCount: todayGlucose.length,
          insulinCount: todayInsulin.length,
          averageGlucose: Math.round(averageGlucose),
          totalInsulin: totalInsulinToday
        },
        weeklyStats: {
          glucoseRecords: glucoseRecords.length,
          insulinRecords: insulinRecords.length,
          averageGlucose: Math.round(averageGlucose)
        },
        recentRecords: [
          ...glucoseRecords.slice(0, 5).map(record => ({ ...record, type: 'glucose' })),
          ...insulinRecords.slice(0, 5).map(record => ({ ...record, type: 'insulin' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10),
        alerts: alerts.filter(alert => !alert.read),
        chartData: {
          glucose: glucoseRecords,
          insulin: insulinRecords
        }
      });
      
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData
  };
};
