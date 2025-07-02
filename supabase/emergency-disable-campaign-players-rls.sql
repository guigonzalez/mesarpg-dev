-- Script de emergência para desabilitar RLS da tabela campaign_players
-- Execute este script para resolver a recursão infinita em campaign_players

-- Verificar status atual
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaign_players';

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaign_players';

-- DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE campaign_players DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Masters can add players to their campaigns" ON campaign_players;
DROP POLICY IF EXISTS "Masters can update players in their campaigns" ON campaign_players;
DROP POLICY IF EXISTS "Masters can remove players from their campaigns" ON campaign_players;

-- Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaign_players';

-- Verificar se todas as políticas foram removidas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaign_players';

-- IMPORTANTE: Após executar este script, o sistema voltará a funcionar completamente
-- mas SEM segurança RLS nas tabelas campaigns e campaign_players
-- Execute scripts de reativação depois para restaurar a segurança
