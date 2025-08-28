-- ================================
-- SCRIPT PARA LIMPAR DADOS EXISTENTES
-- ================================
-- Execute este script no SQL Editor do Supabase para remover
-- todos os dados de teste/CSV e começar do zero

-- ATENÇÃO: Este script irá apagar TODOS os registros de glicemia e insulina
-- Certifique-se de que é isso que você quer fazer!

-- 1. Limpar registros de glicemia
DELETE FROM public.glucose_records 
WHERE user_id = auth.uid();

-- 2. Limpar registros de insulina  
DELETE FROM public.insulin_records 
WHERE user_id = auth.uid();

-- 3. Limpar alertas (opcional)
DELETE FROM public.alerts 
WHERE user_id = auth.uid();

-- 4. Limpar backups (opcional)
DELETE FROM public.backups 
WHERE user_id = auth.uid();

-- 5. Resetar configurações para padrão (opcional)
UPDATE public.user_settings 
SET 
    target_glucose_min = 70,
    target_glucose_max = 180,
    high_glucose_alert = 250,
    low_glucose_alert = 60,
    notifications_enabled = true,
    timezone = 'America/Sao_Paulo',
    notification_settings = '{}',
    privacy_settings = '{}',
    data_settings = '{}',
    reminder_times = '{}',
    updated_at = NOW()
WHERE user_id = auth.uid();

-- Verificar quantos registros restaram (deve ser 0)
SELECT 
    'glucose_records' as tabela,
    COUNT(*) as registros_restantes
FROM public.glucose_records 
WHERE user_id = auth.uid()

UNION ALL

SELECT 
    'insulin_records' as tabela,
    COUNT(*) as registros_restantes
FROM public.insulin_records 
WHERE user_id = auth.uid()

UNION ALL

SELECT 
    'alerts' as tabela,
    COUNT(*) as registros_restantes
FROM public.alerts 
WHERE user_id = auth.uid()

UNION ALL

SELECT 
    'backups' as tabela,
    COUNT(*) as registros_restantes
FROM public.backups 
WHERE user_id = auth.uid();
