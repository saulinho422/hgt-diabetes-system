-- Script para atualizar a função handle_new_user() no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        full_name, 
        diabetes_type, 
        date_of_birth
    )
    VALUES (
        NEW.id,
        (NEW.raw_user_meta_data->>'full_name'),
        (NEW.raw_user_meta_data->>'diabetes_type'),
        CASE 
            WHEN (NEW.raw_user_meta_data->>'date_of_birth') IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
            ELSE NULL
        END
    );
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
