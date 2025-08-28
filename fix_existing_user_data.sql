-- Script para corrigir registros existentes com valores NULL
-- Execute este script no SQL Editor do Supabase Dashboard após atualizar a função

-- Primeiro, vamos ver se há dados no raw_user_meta_data
SELECT 
    id,
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'full_name' as extracted_name,
    raw_user_meta_data->>'diabetes_type' as extracted_diabetes_type,
    raw_user_meta_data->>'date_of_birth' as extracted_date_of_birth
FROM auth.users 
WHERE id IN (
    SELECT id FROM public.user_profiles 
    WHERE full_name IS NULL OR diabetes_type IS NULL
);

-- Se os dados estiverem disponíveis no raw_user_meta_data, atualize os perfis
UPDATE public.user_profiles 
SET 
    full_name = (
        SELECT auth.users.raw_user_meta_data->>'full_name' 
        FROM auth.users 
        WHERE auth.users.id = user_profiles.id
    ),
    diabetes_type = (
        SELECT auth.users.raw_user_meta_data->>'diabetes_type' 
        FROM auth.users 
        WHERE auth.users.id = user_profiles.id
    ),
    date_of_birth = (
        SELECT 
            CASE 
                WHEN auth.users.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
                THEN (auth.users.raw_user_meta_data->>'date_of_birth')::DATE
                ELSE NULL
            END
        FROM auth.users 
        WHERE auth.users.id = user_profiles.id
    )
WHERE full_name IS NULL OR diabetes_type IS NULL;
