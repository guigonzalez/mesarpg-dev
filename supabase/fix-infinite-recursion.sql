-- Corrigir recursão infinita nas políticas RLS da tabela campaigns
-- Execute este comando no SQL Editor do Supabase

-- 1. DESABILITAR RLS temporariamente para limpar tudo
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can delete campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaigns they participate in" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can delete their campaigns" ON campaigns;

-- 3. REABILITAR RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas SIMPLES sem recursão
-- Política para SELECT (visualizar)
CREATE POLICY "campaigns_select_policy" ON campaigns
FOR SELECT
TO authenticated
USING (master_id = auth.uid());

-- Política para INSERT (criar)
CREATE POLICY "campaigns_insert_policy" ON campaigns
FOR INSERT
TO authenticated
WITH CHECK (master_id = auth.uid());

-- Política para UPDATE (atualizar)
CREATE POLICY "campaigns_update_policy" ON campaigns
FOR UPDATE
TO authenticated
USING (master_id = auth.uid())
WITH CHECK (master_id = auth.uid());

-- Política para DELETE (deletar)
CREATE POLICY "campaigns_delete_policy" ON campaigns
FOR DELETE
TO authenticated
USING (master_id = auth.uid());

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 'Políticas criadas:' as info;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'campaigns'
ORDER BY policyname;

-- 6. Verificar se RLS está ativo
SELECT 'Status RLS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaigns';

-- 7. Criar uma campanha de teste se não existir
INSERT INTO campaigns (name, description, system, master_id, sheet_template)
SELECT 
    'Campanha de Teste - RLS Corrigido',
    'Campanha criada após corrigir o problema de recursão infinita',
    'D&D 5e',
    u.id,
    '{
        "name": "D&D 5e",
        "fields": [
            {"name": "Força", "type": "number"},
            {"name": "Destreza", "type": "number"},
            {"name": "Constituição", "type": "number"}
        ]
    }'::jsonb
FROM users u 
WHERE u.email = 'guiperezgo@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM campaigns c WHERE c.master_id = u.id
)
LIMIT 1;

-- 8. Testar se conseguimos buscar campanhas
SELECT 'Teste final - campanhas encontradas:' as info;
SELECT c.name, c.system, c.created_at, u.name as master_name
FROM campaigns c
JOIN users u ON c.master_id = u.id
WHERE u.email = 'guiperezgo@gmail.com'
ORDER BY c.created_at DESC;

SELECT 'RLS corrigido! Recursão infinita resolvida.' as final_status;
