-- Reabilitar RLS na tabela users após criar o primeiro usuário
-- Execute este comando APÓS criar o usuário com sucesso

-- Reabilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verificar se foi reabilitado
SELECT 
  'RLS reabilitado na tabela users' as status,
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Verificar se as políticas estão ativas
SELECT 
  'Políticas ativas na tabela users:' as info,
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

SELECT 'RLS reabilitado com sucesso! Sistema seguro novamente.' as final_status;
