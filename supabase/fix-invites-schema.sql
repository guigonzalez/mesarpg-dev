-- Correção para permitir criar o primeiro usuário sem invited_by
-- Execute este comando no SQL Editor do Supabase

-- Alterar a coluna invited_by para permitir NULL
ALTER TABLE public.invites 
ALTER COLUMN invited_by DROP NOT NULL;

-- Agora podemos criar o primeiro convite sem invited_by
INSERT INTO invites (email, token, expires_at) 
VALUES (
  'mestre@mesarpg.com', 
  'primeiro-usuario-123', 
  NOW() + INTERVAL '7 days'
);

-- Criar um segundo convite para teste
INSERT INTO invites (email, token, expires_at) 
VALUES (
  'jogador@mesarpg.com', 
  'segundo-usuario-456', 
  NOW() + INTERVAL '7 days'
);

-- Verificar os convites criados
SELECT 
  email, 
  token, 
  expires_at, 
  used_at,
  invited_by
FROM invites 
ORDER BY created_at;
