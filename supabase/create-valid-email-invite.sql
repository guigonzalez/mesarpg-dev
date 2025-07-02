-- Criar convite com email que o Supabase definitivamente aceita
-- Execute este comando no SQL Editor do Supabase

-- Deletar convites antigos
DELETE FROM invites WHERE email LIKE '%admin%' OR email LIKE '%teste%';

-- Criar novo convite com email simples e válido
INSERT INTO invites (email, token, expires_at) 
VALUES (
  'user@example.com', 
  'valid-email-999', 
  NOW() + INTERVAL '7 days'
);

-- Verificar o novo convite
SELECT 
  email, 
  token, 
  expires_at, 
  used_at
FROM invites 
WHERE token = 'valid-email-999';

-- Mostrar o link para teste
SELECT 
  CONCAT('https://mesarpg-qvh3la5yk-guiperezgo.vercel.app/invite/', token) as invite_link,
  email
FROM invites 
WHERE token = 'valid-email-999';

-- Alternativa: usar seu próprio email real
-- Substitua 'seuemail@gmail.com' pelo seu email real:
/*
INSERT INTO invites (email, token, expires_at) 
VALUES (
  'seuemail@gmail.com', 
  'meu-email-real', 
  NOW() + INTERVAL '7 days'
);
*/
