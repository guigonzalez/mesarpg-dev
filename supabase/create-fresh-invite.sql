-- Criar um novo convite com email diferente para evitar rate limit
-- Execute este comando no SQL Editor do Supabase

-- Deletar convites antigos
DELETE FROM invites WHERE email LIKE '%teste%';

-- Criar novo convite com email diferente
INSERT INTO invites (email, token, expires_at) 
VALUES (
  'admin.mesarpg@gmail.com', 
  'admin-fresh-789', 
  NOW() + INTERVAL '7 days'
);

-- Verificar o novo convite
SELECT 
  email, 
  token, 
  expires_at, 
  used_at
FROM invites 
WHERE token = 'admin-fresh-789';

-- Mostrar o link para teste
SELECT 
  CONCAT('https://mesarpg-qvh3la5yk-guiperezgo.vercel.app/invite/', token) as invite_link,
  email
FROM invites 
WHERE token = 'admin-fresh-789';
