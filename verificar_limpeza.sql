-- ================================
-- VERIFICAÇÃO FINAL - DADOS LIMPOS
-- ================================
-- Execute este script APÓS o script de limpeza para confirmar
-- que todos os dados foram removidos corretamente

-- Verificar se todas as tabelas estão vazias para o usuário atual
SELECT 
    'glucose_records' as tabela,
    COUNT(*) as total_registros,
    CASE WHEN MIN(date) IS NULL THEN 'N/A' ELSE MIN(date)::text END as data_mais_antiga,
    CASE WHEN MAX(date) IS NULL THEN 'N/A' ELSE MAX(date)::text END as data_mais_recente
FROM public.glucose_records 
WHERE user_id = auth.uid()

UNION ALL

SELECT 
    'insulin_records' as tabela,
    COUNT(*) as total_registros,
    CASE WHEN MIN(date) IS NULL THEN 'N/A' ELSE MIN(date)::text END as data_mais_antiga,
    CASE WHEN MAX(date) IS NULL THEN 'N/A' ELSE MAX(date)::text END as data_mais_recente
FROM public.insulin_records 
WHERE user_id = auth.uid()

UNION ALL

SELECT 
    'alerts' as tabela,
    COUNT(*) as total_registros,
    CASE WHEN MIN(created_at::date) IS NULL THEN 'N/A' ELSE MIN(created_at::date)::text END as data_mais_antiga,
    CASE WHEN MAX(created_at::date) IS NULL THEN 'N/A' ELSE MAX(created_at::date)::text END as data_mais_recente
FROM public.alerts 
WHERE user_id = auth.uid()

ORDER BY tabela;

-- Verificar configurações do usuário (devem estar com valores padrão)
SELECT 
    'Configurações Atuais' as status,
    target_glucose_min,
    target_glucose_max,
    high_glucose_alert,
    low_glucose_alert,
    notifications_enabled,
    timezone,
    notification_settings,
    updated_at
FROM public.user_settings 
WHERE user_id = auth.uid();

-- Verificar informações do perfil (devem permanecer)
SELECT 
    'Perfil do Usuário' as status,
    full_name,
    diabetes_type,
    date_of_birth,
    created_at,
    updated_at
FROM public.user_profiles 
WHERE id = auth.uid();
