import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com a nova chave API válida
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rvkocbmfpwjsnnumawqd.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a29jYm1mcHdqc25udW1hd3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDk0NTMsImV4cCI6MjA3MTkyNTQ1M30.WfCBy2-R9gyFDvpk-7JhfAn6fgvPrW_fN-Mr0hNs1xk';

console.log('🔧 Supabase configurado com nova chave válida ✅');

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Teste básico de conectividade
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Erro na sessão:', error);
  } else {
    console.log('✅ Cliente Supabase funcionando corretamente');
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
    console.log('🚀 Tentando signup com nova chave API');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      console.log('📋 Resposta do signup:', { data, error });
      return { data, error };
    } catch (catchError) {
      console.error('💥 Erro no signup:', catchError);
      return { data: null, error: catchError };
    }
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

  // Funções de dados
  async createGlucoseRecord(userId, glucoseValue, notes = '', mealType = null) {
    const { data, error } = await supabase
      .from(TABLES.GLUCOSE_RECORDS)
      .insert([
        {
          user_id: userId,
          glucose_value: glucoseValue,
          notes,
          meal_type: mealType,
          recorded_at: new Date().toISOString()
        }
      ])
      .select();
    
    return { data, error };
  },

  async getGlucoseRecords(userId, limit = 50) {
    const { data, error } = await supabase
      .from(TABLES.GLUCOSE_RECORDS)
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  },

  async createInsulinRecord(userId, insulinAmount, insulinType, notes = '') {
    const { data, error } = await supabase
      .from(TABLES.INSULIN_RECORDS)
      .insert([
        {
          user_id: userId,
          insulin_amount: insulinAmount,
          insulin_type: insulinType,
          notes,
          recorded_at: new Date().toISOString()
        }
      ])
      .select();
    
    return { data, error };
  },

  async getInsulinRecords(userId, limit = 50) {
    const { data, error } = await supabase
      .from(TABLES.INSULIN_RECORDS)
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    
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
      .upsert([
        {
          user_id: userId,
          ...settings
        }
      ])
      .select();
    
    return { data, error };
  },

  // Relatórios e análises
  async getGlucoseStatistics(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from(TABLES.GLUCOSE_RECORDS)
      .select('glucose_value, recorded_at')
      .eq('user_id', userId)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });
    
    return { data, error };
  },

  async getRecentRecords(userId, limit = 10) {
    const glucosePromise = this.getGlucoseRecords(userId, limit);
    const insulinPromise = this.getInsulinRecords(userId, limit);
    
    const [glucoseResult, insulinResult] = await Promise.all([
      glucosePromise,
      insulinPromise
    ]);
    
    return {
      glucose: glucoseResult,
      insulin: insulinResult
    };
  }
};

// Função para verificar se o usuário está autenticado
export const getCurrentUser = () => supabase.auth.getUser();

// Função para escutar mudanças de autenticação
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;
