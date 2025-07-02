-- Script para reativar RLS na tabela campaign_players
-- Execute este script diretamente no SQL Editor do Supabase

-- Verificar status atual do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaign_players';

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaign_players';

-- Ativar RLS na tabela campaign_players
ALTER TABLE campaign_players ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Mestres podem ver jogadores de suas campanhas, jogadores podem ver outros jogadores das campanhas que participam
CREATE POLICY "Users can view campaign players" ON campaign_players
FOR SELECT
USING (
  -- Mestre da campanha pode ver todos os jogadores
  EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = campaign_players.campaign_id 
    AND campaigns.master_id = auth.uid()
  )
  OR
  -- Jogador pode ver outros jogadores das campanhas que participa
  EXISTS (
    SELECT 1 FROM campaign_players cp2
    WHERE cp2.campaign_id = campaign_players.campaign_id
    AND cp2.user_id = auth.uid()
    AND cp2.status = 'active'
  )
);

-- Política para INSERT: Apenas mestres podem adicionar jogadores às suas campanhas
CREATE POLICY "Masters can add players to their campaigns" ON campaign_players
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = campaign_players.campaign_id 
    AND campaigns.master_id = auth.uid()
  )
);

-- Política para UPDATE: Apenas mestres podem atualizar jogadores de suas campanhas
CREATE POLICY "Masters can update players in their campaigns" ON campaign_players
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = campaign_players.campaign_id 
    AND campaigns.master_id = auth.uid()
  )
);

-- Política para DELETE: Apenas mestres podem remover jogadores de suas campanhas
CREATE POLICY "Masters can remove players from their campaigns" ON campaign_players
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = campaign_players.campaign_id 
    AND campaigns.master_id = auth.uid()
  )
);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'campaign_players';

-- Verificar se RLS foi ativado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'campaign_players';
