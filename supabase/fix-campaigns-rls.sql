-- Corrigir políticas RLS para campanhas
-- Execute este comando no SQL Editor do Supabase

-- 1. Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can view campaigns they participate in" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can delete their campaigns" ON campaigns;

-- 2. Criar políticas mais simples e funcionais
-- Política para visualizar campanhas (como mestre ou jogador)
CREATE POLICY "Users can view their campaigns" ON campaigns
FOR SELECT
TO authenticated
USING (
  master_id = auth.uid() OR
  id IN (
    SELECT campaign_id 
    FROM campaign_players 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Política para criar campanhas
CREATE POLICY "Users can create campaigns" ON campaigns
FOR INSERT
TO authenticated
WITH CHECK (master_id = auth.uid());

-- Política para atualizar campanhas (apenas o mestre)
CREATE POLICY "Masters can update campaigns" ON campaigns
FOR UPDATE
TO authenticated
USING (master_id = auth.uid())
WITH CHECK (master_id = auth.uid());

-- Política para deletar campanhas (apenas o mestre)
CREATE POLICY "Masters can delete campaigns" ON campaigns
FOR DELETE
TO authenticated
USING (master_id = auth.uid());

-- 3. Garantir que RLS está habilitado
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se as políticas foram criadas
SELECT 'Políticas criadas para campaigns:' as info;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'campaigns'
ORDER BY policyname;

-- 5. Testar se conseguimos buscar campanhas
SELECT 'Teste de busca de campanhas:' as info;
SELECT COUNT(*) as total_campaigns FROM campaigns;

-- 6. Criar uma campanha de teste se não existir
INSERT INTO campaigns (name, description, system, master_id, sheet_template)
SELECT 
    'Minha Primeira Campanha',
    'Campanha criada automaticamente para testar o dashboard',
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
)
LIMIT 1;

SELECT 'Campanhas disponíveis após correção:' as info;
SELECT c.name, c.system, u.name as master_name, c.created_at
FROM campaigns c
LEFT JOIN users u ON c.master_id = u.id
ORDER BY c.created_at DESC;
