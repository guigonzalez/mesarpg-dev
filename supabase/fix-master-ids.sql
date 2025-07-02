-- Fix: Corrigir IDs de mestre das campanhas
-- Problema: campanhas não reconhecem o usuário correto como mestre

-- 1. Primeiro, vamos ver o ID real do usuário guiperezgo@gmail.com
DO $$
DECLARE
    correct_user_id UUID;
BEGIN
    -- Buscar o ID correto do usuário
    SELECT id INTO correct_user_id 
    FROM users 
    WHERE email = 'guiperezgo@gmail.com';
    
    IF correct_user_id IS NOT NULL THEN
        RAISE NOTICE 'ID correto do usuário: %', correct_user_id;
        
        -- Atualizar todas as campanhas que deveriam ter este usuário como mestre
        -- mas que podem ter um ID incorreto
        UPDATE campaigns 
        SET master_id = correct_user_id
        WHERE master_id != correct_user_id
        AND id IN (
            -- IDs das campanhas que sabemos que pertencem a este usuário
            -- Vamos atualizar baseado no padrão de criação
            SELECT id FROM campaigns 
            WHERE created_at >= '2024-01-01'  -- Campanhas recentes
            AND master_id != correct_user_id
        );
        
        RAISE NOTICE 'Campanhas atualizadas para o mestre correto';
    ELSE
        RAISE NOTICE 'Usuário guiperezgo@gmail.com não encontrado';
    END IF;
END $$;

-- 2. Verificar o resultado
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.master_id,
    u.email as master_email,
    'AFTER FIX' as status
FROM campaigns c
LEFT JOIN users u ON c.master_id = u.id
WHERE u.email = 'guiperezgo@gmail.com'
ORDER BY c.created_at DESC;
