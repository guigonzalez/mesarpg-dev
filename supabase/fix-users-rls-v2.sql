-- Versão 2: Corrigir políticas RLS da tabela users de forma mais robusta
-- Execute este comando no SQL Editor do Supabase

-- Primeiro, remover a política anterior se existir
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;

-- Criar uma política mais permissiva para INSERT
-- Permite que qualquer usuário autenticado crie um perfil com seu próprio ID
CREATE POLICY "Allow authenticated users to create profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Também permitir que usuários atualizem invites (para marcar como usado)
DROP POLICY IF EXISTS "Users can update their own invites" ON public.invites;
CREATE POLICY "Allow updating invites" ON public.invites
  FOR UPDATE 
  USING (true);

-- Verificar todas as políticas da tabela users
SELECT 
  'Políticas da tabela users:' as info,
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Verificar políticas da tabela invites
SELECT 
  'Políticas da tabela invites:' as info,
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'invites'
ORDER BY policyname;

-- Testar se as políticas foram criadas
SELECT 'Políticas atualizadas com sucesso!' as status;
