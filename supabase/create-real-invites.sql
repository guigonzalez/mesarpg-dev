-- Criar convites com emails reais para teste
-- Execute este comando no SQL Editor do Supabase

-- Deletar convites antigos
DELETE FROM invites WHERE token IN ('primeiro-usuario-123', 'segundo-usuario-456');

-- Criar novos convites com emails reais
INSERT INTO invites (email, token, expires_at) 
VALUES 
  ('teste.mestre@gmail.com', 'mestre-real-123', NOW() + INTERVAL '7 days'),
  ('teste.jogador@gmail.com', 'jogador-real-456', NOW() + INTERVAL '7 days');

-- Verificar os convites criados
SELECT 
  email, 
  token, 
  expires_at, 
  used_at,
  invited_by
FROM invites 
WHERE token IN ('mestre-real-123', 'jogador-real-456')
ORDER BY created_at;

-- Mostrar os links para teste
SELECT 
  CONCAT('https://mesarpg-ayru8m8vt-guiperezgo.vercel.app/invite/', token) as invite_link,
  email
FROM invites 
WHERE token IN ('mestre-real-123', 'jogador-real-456');
