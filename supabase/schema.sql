-- ================================
-- ESQUEMA SQL PARA SUPABASE - Sistema HGT
-- ================================

-- Habilitar Row Level Security (RLS) por padrão
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ================================
-- 1. TABELA DE USUÁRIOS (usando auth.users do Supabase)
-- ================================

-- Perfil estendido do usuário
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    date_of_birth DATE,
    diabetes_type VARCHAR(20) CHECK (diabetes_type IN ('type1', 'type2', 'gestational', 'other')),
    diagnosis_date DATE,
    phone VARCHAR(20),
    emergency_contact TEXT,
    doctor_name TEXT,
    doctor_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================
-- 2. REGISTROS DE GLICEMIA
-- ================================

CREATE TABLE public.glucose_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    period VARCHAR(20) NOT NULL,
    glucose_value INTEGER NOT NULL CHECK (glucose_value > 0 AND glucose_value < 1000),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_glucose_records_user_date ON public.glucose_records(user_id, date DESC);
CREATE INDEX idx_glucose_records_user_period ON public.glucose_records(user_id, period);
CREATE INDEX idx_glucose_records_created ON public.glucose_records(created_at DESC);

-- RLS para glucose_records
ALTER TABLE public.glucose_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own glucose records" ON public.glucose_records
    FOR ALL USING (auth.uid() = user_id);

-- ================================
-- 3. REGISTROS DE INSULINA
-- ================================

CREATE TABLE public.insulin_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    period VARCHAR(20) NOT NULL,
    insulin_type VARCHAR(20) DEFAULT 'rapid' CHECK (insulin_type IN ('rapid', 'long', 'mixed', 'other')),
    units DECIMAL(5,2) NOT NULL CHECK (units > 0 AND units <= 999.99),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_insulin_records_user_date ON public.insulin_records(user_id, date DESC);
CREATE INDEX idx_insulin_records_user_period ON public.insulin_records(user_id, period);

-- RLS para insulin_records
ALTER TABLE public.insulin_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own insulin records" ON public.insulin_records
    FOR ALL USING (auth.uid() = user_id);

-- ================================
-- 4. CONFIGURAÇÕES DO USUÁRIO
-- ================================

CREATE TABLE public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    data_settings JSONB DEFAULT '{}',
    reminder_times JSONB DEFAULT '{}',
    target_glucose_min INTEGER DEFAULT 70,
    target_glucose_max INTEGER DEFAULT 180,
    high_glucose_alert INTEGER DEFAULT 250,
    low_glucose_alert INTEGER DEFAULT 60,
    notifications_enabled BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- ================================
-- 5. SISTEMA DE ALERTAS
-- ================================

CREATE TABLE public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    glucose_value INTEGER,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_alerts_user_read ON public.alerts(user_id, read);
CREATE INDEX idx_alerts_user_created ON public.alerts(user_id, created_at DESC);

-- RLS para alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts" ON public.alerts
    FOR ALL USING (auth.uid() = user_id);

-- ================================
-- 6. SISTEMA DE BACKUP
-- ================================

CREATE TABLE public.backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    backup_data JSONB, -- Para armazenar dados de backup em formato JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_backups_user_status ON public.backups(user_id, status);
CREATE INDEX idx_backups_created ON public.backups(created_at DESC);

-- RLS para backups
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own backups" ON public.backups
    FOR ALL USING (auth.uid() = user_id);

-- ================================
-- 7. TRIGGERS PARA UPDATED_AT
-- ================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tabelas com updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.glucose_records
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.insulin_records
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ================================
-- 8. FUNÇÕES UTILITÁRIAS
-- ================================

-- Função para calcular estatísticas de glicemia
CREATE OR REPLACE FUNCTION public.get_glucose_stats(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    avg_glucose NUMERIC,
    min_glucose INTEGER,
    max_glucose INTEGER,
    count_records BIGINT,
    time_in_range_percentage NUMERIC
) AS $$
DECLARE
    target_min INTEGER := 70;
    target_max INTEGER := 180;
BEGIN
    -- Buscar configurações do usuário
    SELECT us.target_glucose_min, us.target_glucose_max 
    INTO target_min, target_max
    FROM public.user_settings us 
    WHERE us.user_id = p_user_id;
    
    -- Se não encontrou configurações, usar valores padrão
    IF target_min IS NULL THEN target_min := 70; END IF;
    IF target_max IS NULL THEN target_max := 180; END IF;
    
    RETURN QUERY
    SELECT 
        ROUND(AVG(gr.glucose_value), 2) as avg_glucose,
        MIN(gr.glucose_value) as min_glucose,
        MAX(gr.glucose_value) as max_glucose,
        COUNT(*) as count_records,
        ROUND(
            (COUNT(*) FILTER (WHERE gr.glucose_value BETWEEN target_min AND target_max)::NUMERIC / 
             NULLIF(COUNT(*), 0)) * 100, 2
        ) as time_in_range_percentage
    FROM public.glucose_records gr
    WHERE gr.user_id = p_user_id
        AND (p_start_date IS NULL OR gr.date >= p_start_date)
        AND (p_end_date IS NULL OR gr.date <= p_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 9. VIEWS PARA RELATÓRIOS
-- ================================

-- View para registros recentes
CREATE VIEW public.recent_records AS
SELECT 
    'glucose' as record_type,
    id,
    user_id,
    date,
    period,
    glucose_value as value,
    NULL as units,
    notes,
    created_at
FROM public.glucose_records
UNION ALL
SELECT 
    'insulin' as record_type,
    id,
    user_id,
    date,
    period,
    NULL as value,
    units,
    notes,
    created_at
FROM public.insulin_records
ORDER BY created_at DESC;

-- ================================
-- 10. DADOS INICIAIS
-- ================================

-- Inserir configurações padrão quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id)
    VALUES (NEW.id);
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil e configurações automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ================================
-- 11. STORAGE PARA ARQUIVOS
-- ================================

-- Bucket para backups e arquivos de usuários
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false);

-- Política de storage para arquivos de usuários
CREATE POLICY "Users can upload own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ================================
-- 12. REALTIME SUBSCRIPTIONS
-- ================================

-- Habilitar realtime para tabelas relevantes
ALTER PUBLICATION supabase_realtime ADD TABLE public.glucose_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insulin_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- ================================
-- COMENTÁRIOS FINAIS
-- ================================

COMMENT ON TABLE public.user_profiles IS 'Perfis estendidos dos usuários com informações médicas';
COMMENT ON TABLE public.glucose_records IS 'Registros de medições de glicemia';
COMMENT ON TABLE public.insulin_records IS 'Registros de aplicações de insulina';
COMMENT ON TABLE public.user_settings IS 'Configurações personalizadas de cada usuário';
COMMENT ON TABLE public.alerts IS 'Sistema de alertas e notificações';
COMMENT ON TABLE public.backups IS 'Backups de dados dos usuários';

-- Finalizado! Schema otimizado para Supabase com RLS e realtime.
