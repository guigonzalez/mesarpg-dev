-- Criar campanhas de exemplo para testar o dashboard
-- Execute este comando no SQL Editor do Supabase

-- Buscar o ID do usuário criado
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Pegar o ID do usuário com email guiperezgo@gmail.com
    SELECT id INTO user_id FROM users WHERE email = 'guiperezgo@gmail.com' LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        -- Criar campanhas de exemplo
        INSERT INTO campaigns (name, description, system, master_id, sheet_template) VALUES
        (
            'A Lenda da Espada Perdida',
            'Uma aventura épica em busca da lendária Espada do Destino, perdida há séculos nas profundezas de uma masmorra ancestral.',
            'D&D 5e',
            user_id,
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
            }'
        ),
        (
            'Noites de Sangue',
            'Uma crônica sombria no mundo dos vampiros, onde política, poder e sangue se misturam nas ruas de São Paulo.',
            'Vampiro: A Máscara',
            user_id,
            '{
                "name": "Vampiro: A Máscara",
                "fields": [
                    {"name": "Clã", "type": "text"},
                    {"name": "Geração", "type": "number"},
                    {"name": "Força de Vontade", "type": "number"},
                    {"name": "Humanidade", "type": "number"},
                    {"name": "Vitae", "type": "number"}
                ]
            }'
        ),
        (
            'Aventuras na Terra Média',
            'Uma jornada livre inspirada no mundo de Tolkien, onde heróis improváveis enfrentam as sombras que ameaçam a paz.',
            'Livre',
            user_id,
            '{
                "name": "Livre",
                "fields": [
                    {"name": "Nome", "type": "text"},
                    {"name": "Raça", "type": "text"},
                    {"name": "Profissão", "type": "text"},
                    {"name": "Nível de Experiência", "type": "number"}
                ]
            }'
        );
        
        RAISE NOTICE 'Campanhas de exemplo criadas com sucesso para o usuário %', user_id;
    ELSE
        RAISE NOTICE 'Usuário não encontrado com email guiperezgo@gmail.com';
    END IF;
END $$;

-- Verificar as campanhas criadas
SELECT 
    c.name,
    c.description,
    c.system,
    u.name as master_name,
    c.created_at
FROM campaigns c
JOIN users u ON c.master_id = u.id
ORDER BY c.created_at DESC;
