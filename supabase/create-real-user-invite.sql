-- Criar convite com email real do usuário
-- Execute este comando no SQL Editor do Supabase

-- Deletar convites antigos
DELETE FROM invites WHERE email LIKE '%user@example%' OR email LIKE '%admin%' OR email LIKE '%teste%';

-- Criar novo convite com email real
INSERT INTO invites (email, token, expires_at) 
VALUES (
  'guiperezgo@gmail.com', 
  'gui-real-email-123', 
  NOW() + INTERVAL '7 days'
);

-- Verificar o novo convite
SELECT 
  email, 
  token, 
  expires_at, 
  used_at
FROM invites 
WHERE token = 'gui-real-email-123';

-- Mostrar o link para teste
SELECT 
  CONCAT('https://mesarpg-qvh3la5yk-guiperezgo.vercel.app/invite/', token) as invite_link,
  email
FROM invites 
WHERE token = 'gui-real-email-123';

SELECT 'Convite criado com email real: guiperezgo@gmail.com' as status;
