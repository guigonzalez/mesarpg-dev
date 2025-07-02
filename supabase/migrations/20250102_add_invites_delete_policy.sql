-- Adicionar política de DELETE para invites
-- Permite que o usuário que criou o convite possa deletá-lo

CREATE POLICY "Users can delete their own invites" ON invites
FOR DELETE
USING (invited_by = auth.uid());
