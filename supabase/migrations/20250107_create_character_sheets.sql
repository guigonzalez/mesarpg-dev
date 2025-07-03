-- Criar tabela para fichas de personagens dos jogadores
CREATE TABLE character_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_name VARCHAR(255) NOT NULL,
  sheet_data JSONB NOT NULL,
  template_version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_player_per_campaign UNIQUE(campaign_id, player_id),
  CONSTRAINT character_name_not_empty CHECK (LENGTH(TRIM(character_name)) > 0)
);

-- Índices para performance
CREATE INDEX idx_character_sheets_campaign_id ON character_sheets(campaign_id);
CREATE INDEX idx_character_sheets_player_id ON character_sheets(player_id);
CREATE INDEX idx_character_sheets_status ON character_sheets(status);

-- Índice GIN para consultas no JSONB
CREATE INDEX idx_character_sheets_data ON character_sheets USING GIN (sheet_data);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_character_sheets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_character_sheets_updated_at
  BEFORE UPDATE ON character_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_character_sheets_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE character_sheets ENABLE ROW LEVEL SECURITY;

-- Policy: Jogadores podem ver apenas suas próprias fichas
CREATE POLICY "Players can view own character sheets" ON character_sheets
  FOR SELECT USING (
    auth.uid() = player_id OR 
    auth.uid() IN (
      SELECT master_id FROM campaigns WHERE id = campaign_id
    )
  );

-- Policy: Jogadores podem criar suas próprias fichas
CREATE POLICY "Players can create own character sheets" ON character_sheets
  FOR INSERT WITH CHECK (
    auth.uid() = player_id AND
    auth.uid() IN (
      SELECT user_id FROM campaign_players 
      WHERE campaign_id = character_sheets.campaign_id 
      AND status = 'active'
    )
  );

-- Policy: Jogadores podem atualizar suas próprias fichas
CREATE POLICY "Players can update own character sheets" ON character_sheets
  FOR UPDATE USING (
    auth.uid() = player_id AND
    auth.uid() IN (
      SELECT user_id FROM campaign_players 
      WHERE campaign_id = character_sheets.campaign_id 
      AND status = 'active'
    )
  );

-- Policy: Mestres podem atualizar fichas de suas campanhas (para aprovação)
CREATE POLICY "Masters can update character sheets in their campaigns" ON character_sheets
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT master_id FROM campaigns WHERE id = campaign_id
    )
  );

-- Policy: Jogadores podem deletar suas próprias fichas
CREATE POLICY "Players can delete own character sheets" ON character_sheets
  FOR DELETE USING (
    auth.uid() = player_id
  );

-- Comentários para documentação
COMMENT ON TABLE character_sheets IS 'Fichas de personagens preenchidas pelos jogadores baseadas nos templates das campanhas';
COMMENT ON COLUMN character_sheets.sheet_data IS 'Dados da ficha em formato JSONB contendo os valores preenchidos pelo jogador';
COMMENT ON COLUMN character_sheets.template_version IS 'Versão do template usado para criar esta ficha';
COMMENT ON COLUMN character_sheets.status IS 'Status da ficha: draft (rascunho), submitted (enviada), approved (aprovada), rejected (rejeitada)';
