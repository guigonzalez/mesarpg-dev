-- Script para corrigir recursão infinita nas políticas da tabela campaigns
-- Execute este script diretamente no SQL Editor do Supabase

-- Verificar políticas existentes na tabela campaigns
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaigns';

-- Remover todas as políticas existentes da tabela campaigns
DROP POLICY IF EXISTS "Users can view campaigns they are part of" ON campaigns;
DROP POLICY IF EXISTS "Users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Players can view campaigns they are part of" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can delete their campaigns" ON campaigns;

-- Criar políticas simples e sem recursão

-- Política para SELECT: Mestres veem suas campanhas + jogadores veem campanhas que participam
CREATE POLICY "View campaigns" ON campaigns
FOR SELECT
USING (
  -- Mestre da campanha
  master_id = auth.uid()
  OR
  -- Jogador da campanha
  id IN (
    SELECT campaign_id 
    FROM campaign_players 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Política para INSERT: Usuários autenticados podem criar campanhas
CREATE POLICY "Create campaigns" ON campaigns
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND master_id = auth.uid()
);

-- Política para UPDATE: Apenas mestres podem atualizar suas campanhas
CREATE POLICY "Update campaigns" ON campaigns
FOR UPDATE
USING (master_id = auth.uid())
WITH CHECK (master_id = auth.uid());

-- Política para DELETE: Apenas mestres podem deletar suas campanhas
CREATE POLICY "Delete campaigns" ON campaigns
FOR DELETE
USING (master_id = auth.uid());

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaigns';
