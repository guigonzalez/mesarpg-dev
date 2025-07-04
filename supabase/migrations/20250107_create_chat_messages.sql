-- Criar tabela para mensagens do chat em tempo real
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'roll', 'system', 'whisper')),
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Para mensagens privadas/whisper
  metadata JSONB DEFAULT '{}', -- Para dados extras como resultados de dados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT message_not_empty CHECK (LENGTH(TRIM(message)) > 0),
  CONSTRAINT whisper_has_target CHECK (
    (message_type = 'whisper' AND target_user_id IS NOT NULL) OR 
    (message_type != 'whisper')
  )
);

-- Índices para performance
CREATE INDEX idx_chat_messages_campaign_id ON chat_messages(campaign_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_campaign_created ON chat_messages(campaign_id, created_at DESC);

-- Índice GIN para consultas no JSONB metadata
CREATE INDEX idx_chat_messages_metadata ON chat_messages USING GIN (metadata);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_messages_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver mensagens das campanhas onde participam
CREATE POLICY "Users can view messages from their campaigns" ON chat_messages
  FOR SELECT USING (
    campaign_id IN (
      -- Campanhas onde é mestre
      SELECT id FROM campaigns WHERE master_id = auth.uid()
      UNION
      -- Campanhas onde é jogador ativo
      SELECT campaign_id FROM campaign_players 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND (
      -- Mensagens públicas ou do sistema
      message_type IN ('text', 'roll', 'system')
      OR
      -- Mensagens privadas onde é o remetente ou destinatário
      (message_type = 'whisper' AND (user_id = auth.uid() OR target_user_id = auth.uid()))
    )
  );

-- Policy: Usuários podem criar mensagens nas campanhas onde participam
CREATE POLICY "Users can create messages in their campaigns" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    campaign_id IN (
      -- Campanhas onde é mestre
      SELECT id FROM campaigns WHERE master_id = auth.uid()
      UNION
      -- Campanhas onde é jogador ativo
      SELECT campaign_id FROM campaign_players 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Usuários podem atualizar apenas suas próprias mensagens (para edição)
CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE USING (
    auth.uid() = user_id AND
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
      UNION
      SELECT campaign_id FROM campaign_players 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Usuários podem deletar apenas suas próprias mensagens
CREATE POLICY "Users can delete own messages" ON chat_messages
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Função para limpar mensagens antigas (opcional, para manutenção)
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_messages 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE chat_messages IS 'Mensagens do chat em tempo real para campanhas de RPG';
COMMENT ON COLUMN chat_messages.message_type IS 'Tipo da mensagem: text (normal), roll (rolagem de dados), system (sistema), whisper (privada)';
COMMENT ON COLUMN chat_messages.target_user_id IS 'ID do usuário destinatário para mensagens privadas (whisper)';
COMMENT ON COLUMN chat_messages.metadata IS 'Dados extras em JSON como resultados de dados, comandos especiais, etc.';
COMMENT ON FUNCTION cleanup_old_chat_messages IS 'Função para limpar mensagens antigas do chat (manutenção)';
