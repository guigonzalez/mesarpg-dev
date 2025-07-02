-- Add RLS policy to allow players to view campaigns they are part of
-- This fixes the issue where campaign data returns null in joins for players

-- Add policy for players to view campaigns they participate in
CREATE POLICY "Players can view campaigns they are part of" ON campaigns
FOR SELECT
USING (
  id IN (
    SELECT campaign_id 
    FROM campaign_players 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Ensure the existing master policy is still there
-- (This should already exist, but adding for completeness)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'campaigns' 
    AND policyname = 'Masters can manage their own campaigns'
  ) THEN
    CREATE POLICY "Masters can manage their own campaigns" ON campaigns
    FOR ALL
    USING (master_id = auth.uid());
  END IF;
END $$;

-- Add comment explaining the policies
COMMENT ON TABLE campaigns IS 'RLS enabled: Masters can manage their campaigns, Players can view campaigns they participate in';
