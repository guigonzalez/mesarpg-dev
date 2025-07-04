-- Corrigir políticas RLS para character_sheets
-- O problema é que a política de INSERT está muito restritiva

-- Remover políticas existentes
DROP POLICY IF EXISTS "Players can create own character sheets" ON character_sheets;
DROP POLICY IF EXISTS "Players can update own character sheets" ON character_sheets;

-- Policy: Jogadores podem criar suas próprias fichas (incluindo mestres)
CREATE POLICY "Players can create own character sheets" ON character_sheets
  FOR INSERT WITH CHECK (
    auth.uid() = player_id AND
    (
      -- Jogador está na campanha como player ativo
      auth.uid() IN (
        SELECT user_id FROM campaign_players 
        WHERE campaign_id = character_sheets.campaign_id 
        AND status = 'active'
      )
      OR
      -- OU é o mestre da campanha
      auth.uid() IN (
        SELECT master_id FROM campaigns WHERE id = character_sheets.campaign_id
      )
    )
  );

-- Policy: Jogadores podem atualizar suas próprias fichas (incluindo mestres)
CREATE POLICY "Players can update own character sheets" ON character_sheets
  FOR UPDATE USING (
    auth.uid() = player_id AND
    (
      -- Jogador está na campanha como player ativo
      auth.uid() IN (
        SELECT user_id FROM campaign_players 
        WHERE campaign_id = character_sheets.campaign_id 
        AND status = 'active'
      )
      OR
      -- OU é o mestre da campanha
      auth.uid() IN (
        SELECT master_id FROM campaigns WHERE id = character_sheets.campaign_id
      )
    )
  );

-- Comentário sobre a correção
COMMENT ON POLICY "Players can create own character sheets" ON character_sheets IS 
'Permite que jogadores ativos e mestres criem fichas de personagem nas campanhas onde têm acesso';

COMMENT ON POLICY "Players can update own character sheets" ON character_sheets IS 
'Permite que jogadores ativos e mestres atualizem suas próprias fichas de personagem';
