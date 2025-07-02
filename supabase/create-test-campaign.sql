-- Criar campanha de teste simples
-- Execute este comando no SQL Editor do Supabase

-- Primeiro, verificar se o usuário existe
SELECT 'Verificando usuário:' as info;
SELECT id, email, name FROM users WHERE email = 'guiperezgo@gmail.com';

-- Criar uma campanha de teste
INSERT INTO campaigns (name, description, system, master_id, sheet_template)
SELECT 
    'Minha Primeira Aventura',
    'Uma campanha de teste para verificar se o dashboard está funcionando',
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
            {"name": "Carisma", "type": "number"}
        ]
    }'::jsonb
FROM users u 
WHERE u.email = 'guiperezgo@gmail.com'
LIMIT 1;

-- Verificar se foi criada
SELECT 'Campanha criada:' as info;
SELECT c.name, c.system, c.created_at, u.name as master_name
FROM campaigns c
JOIN users u ON c.master_id = u.id
WHERE u.email = 'guiperezgo@gmail.com'
ORDER BY c.created_at DESC;
