-- Corrigir políticas RLS da tabela users para permitir criação de novos usuários
-- Execute este comando no SQL Editor do Supabase

-- Adicionar política para permitir que usuários autenticados criem seu próprio perfil
CREATE POLICY "Users can create their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verificar as políticas existentes
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Testar se a política foi criada corretamente
SELECT 'Política INSERT criada para tabela users' as status;
