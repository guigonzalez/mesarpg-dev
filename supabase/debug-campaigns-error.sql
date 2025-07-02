-- Debug do erro de campanhas no dashboard
-- Execute este comando no SQL Editor do Supabase

-- 1. Verificar se a tabela campaigns existe
SELECT 'Verificando tabela campaigns:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'campaigns';

-- 2. Verificar se há dados na tabela campaigns
SELECT 'Contando campanhas:' as info;
SELECT COUNT(*) as total_campaigns FROM campaigns;

-- 3. Verificar RLS na tabela campaigns
SELECT 'Status RLS campaigns:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaigns';

-- 4. Verificar políticas na tabela campaigns
SELECT 'Políticas campaigns:' as info;
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'campaigns';

-- 5. Verificar se o usuário existe na tabela users
SELECT 'Verificando usuário:' as info;
SELECT id, email, name, created_at 
FROM users 
WHERE email = 'guiperezgo@gmail.com';

-- 6. Tentar buscar campanhas como o usuário faria
SELECT 'Tentando buscar campanhas:' as info;
SELECT c.*, u.name as master_name
FROM campaigns c
LEFT JOIN users u ON c.master_id = u.id
LIMIT 5;

-- 7. Verificar se há campanhas para o usuário específico
SELECT 'Campanhas do usuário:' as info;
SELECT c.name, c.system, c.created_at, u.name as master_name
FROM campaigns c
LEFT JOIN users u ON c.master_id = u.id
WHERE c.master_id = (SELECT id FROM users WHERE email = 'guiperezgo@gmail.com' LIMIT 1);

-- 8. Se não houver campanhas, criar uma de exemplo
INSERT INTO campaigns (name, description, system, master_id, sheet_template)
SELECT 
    'Campanha de Teste',
    'Uma campanha criada automaticamente para testar o sistema',
    'D&D 5e',
    u.id,
    '{
        "name": "D&D 5e",
        "fields": [
            {"name": "Força", "type": "number"},
            {"name": "Destreza", "type": "number"},
            {"name": "Constituição", "type": "number"},
            {"name": "Inteligência", "type": "number"},
            {"name": "Sabedoria", "type": "number"},
            {"name": "Carisma", "type": "number"},
            {"name": "Classe", "type": "text"},
            {"name": "Nível", "type": "number"},
            {"name": "Pontos de Vida", "type": "number"}
        ]
    }'::jsonb
FROM users u 
WHERE u.email = 'guiperezgo@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM campaigns c WHERE c.master_id = u.id
);

-- 9. Verificar resultado final
SELECT 'Resultado final:' as info;
SELECT COUNT(*) as total_campaigns_after FROM campaigns;

SELECT 'Campanhas criadas:' as info;
SELECT c.name, c.system, u.name as master_name, c.created_at
FROM campaigns c
LEFT JOIN users u ON c.master_id = u.id
ORDER BY c.created_at DESC;
