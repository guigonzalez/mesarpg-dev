-- Script de emergência para desabilitar RLS da tabela campaigns
-- Execute este script para restaurar o acesso imediatamente

-- Verificar status atual
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaigns';

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaigns';

-- DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "View campaigns" ON campaigns;
DROP POLICY IF EXISTS "Create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Delete campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaigns they are part of" ON campaigns;
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Players can view campaigns they are part of" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can delete their campaigns" ON campaigns;

-- Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaigns';

-- Verificar se todas as políticas foram removidas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaigns';

-- IMPORTANTE: Após executar este script, o sistema voltará a funcionar
-- mas SEM segurança RLS na tabela campaigns
-- Execute o próximo script para reativar a segurança adequadamente
