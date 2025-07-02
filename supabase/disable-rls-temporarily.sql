-- TEMPORARIAMENTE desabilitar RLS na tabela users para permitir criação do primeiro usuário
-- Execute este comando no SQL Editor do Supabase

-- Verificar o estado atual do RLS
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'invites');

-- Desabilitar RLS temporariamente na tabela users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT 
  'RLS desabilitado na tabela users' as status,
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- IMPORTANTE: Após criar o primeiro usuário, execute este comando para reabilitar:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

SELECT 'ATENÇÃO: Lembre-se de reabilitar o RLS após criar o usuário!' as warning;
