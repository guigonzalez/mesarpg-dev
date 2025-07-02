-- Script para adicionar política de DELETE para invites
-- Execute este script diretamente no SQL Editor do Supabase

-- Verificar políticas existentes na tabela invites
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'invites';

-- Adicionar política de DELETE para invites
CREATE POLICY "Users can delete their own invites" ON invites
FOR DELETE
USING (invited_by = auth.uid());

-- Verificar se a política foi criada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'invites' AND policyname = 'Users can delete their own invites';
