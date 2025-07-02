-- Script para debugar problemas com convites
-- Execute este comando no SQL Editor do Supabase

-- 1. Verificar se a tabela invites existe e tem dados
SELECT 'Verificando tabela invites:' as debug_step;
SELECT 
  id,
  email, 
  token, 
  expires_at, 
  used_at,
  invited_by,
  created_at
FROM invites 
ORDER BY created_at DESC;

-- 2. Verificar se os tokens específicos existem
SELECT 'Verificando tokens específicos:' as debug_step;
SELECT 
  token,
  email,
  expires_at > NOW() as is_not_expired,
  used_at IS NULL as is_not_used,
  (expires_at > NOW() AND used_at IS NULL) as is_valid
FROM invites 
WHERE token IN ('primeiro-usuario-123', 'segundo-usuario-456');

-- 3. Verificar timezone e data atual
SELECT 'Verificando timezone:' as debug_step;
SELECT 
  NOW() as current_time,
  NOW() + INTERVAL '7 days' as expires_time_example;

-- 4. Verificar políticas RLS que podem estar bloqueando
SELECT 'Verificando RLS:' as debug_step;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'invites';

-- 5. Se não houver dados, criar novos convites com debug
DELETE FROM invites WHERE token IN ('primeiro-usuario-123', 'segundo-usuario-456');

INSERT INTO invites (email, token, expires_at) 
VALUES 
  ('mestre@mesarpg.com', 'primeiro-usuario-123', NOW() + INTERVAL '7 days'),
  ('jogador@mesarpg.com', 'segundo-usuario-456', NOW() + INTERVAL '7 days');

-- 6. Verificar novamente após inserção
SELECT 'Dados após inserção:' as debug_step;
SELECT 
  id,
  email, 
  token, 
  expires_at, 
  used_at,
  invited_by,
  created_at,
  expires_at > NOW() as is_valid_time,
  used_at IS NULL as is_not_used
FROM invites 
WHERE token IN ('primeiro-usuario-123', 'segundo-usuario-456')
ORDER BY created_at DESC;
