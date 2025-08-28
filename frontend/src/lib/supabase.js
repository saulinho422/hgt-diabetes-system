import React from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rvkocbmfpwjsnnumawqd.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a29jYm1mcHdqc25udW1hd3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzc3NzcsImV4cCI6MjA1MDk1Mzc3N30.ZftdgexAE6b2NzQF9HuQ1_mD6TMXJJGfGI7lNWWz8pU';

// Debug: verificar se as variáveis estão sendo carregadas
console.log('🔧 Configuração Supabase:');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey ? 'Carregada ✅' : 'Não encontrada ❌');
console.log('🌍 ENV Vars:', {
  REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    enabled: true
  }
});

// Configuração de schemas para diabetes
export const TABLES = {
  USERS: 'users',
  GLUCOSE_RECORDS: 'glucose_records', 
  INSULIN_RECORDS: 'insulin_records',
  USER_SETTINGS: 'user_settings',
  ALERTS: 'alerts',
  BACKUPS: 'backups'
};

// Helper functions para facilitar o uso
export const supabaseHelpers = {
  // Autenticação
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Glicemia
  async createGlucoseRecord(record) {
    const { data, error } = await supabase
      .from(TABLES.GLUCOSE_RECORDS)
      .insert([record])
      .select();
    return { data, error };
  },

  async getGlucoseRecords(userId, filters = {}) {
    let query = supabase
      .from(TABLES.GLUCOSE_RECORDS)
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters.period) {
      query = query.eq('period', filters.period);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Insulina
  async createInsulinRecord(record) {
    const { data, error } = await supabase
      .from(TABLES.INSULIN_RECORDS)
      .insert([record])
      .select();
    return { data, error };
  },

  async getInsulinRecords(userId, filters = {}) {
    let query = supabase
      .from(TABLES.INSULIN_RECORDS)
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Configurações do usuário
  async getUserSettings(userId) {
    const { data, error } = await supabase
      .from(TABLES.USER_SETTINGS)
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async updateUserSettings(userId, settings) {
    const { data, error } = await supabase
      .from(TABLES.USER_SETTINGS)
      .upsert([{ user_id: userId, ...settings }])
      .select();
    return { data, error };
  },

  // Alertas
  async getAlerts(userId) {
    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async markAlertAsRead(alertId) {
    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .update({ read: true })
      .eq('id', alertId);
    return { data, error };
  },

  // Real-time subscriptions
  subscribeToGlucoseRecords(userId, callback) {
    return supabase
      .channel('glucose-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: TABLES.GLUCOSE_RECORDS, filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe();
  },

  subscribeToAlerts(userId, callback) {
    return supabase
      .channel('alerts-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLES.ALERTS, filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe();
  }
};

// Context Provider para facilitar o uso no React
export const SupabaseContext = React.createContext(supabase);

export default supabase;
