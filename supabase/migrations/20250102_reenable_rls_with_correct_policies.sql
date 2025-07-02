-- Re-enable RLS with correct, non-recursive policies
-- This migration restores security after fixing the infinite recursion issue

-- Re-enable RLS on campaigns table
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for campaigns
-- Policy 1: Users can view campaigns where they are the master
CREATE POLICY "campaigns_masters_can_view" ON campaigns
FOR SELECT USING (
  auth.uid() = master_id
);

-- Policy 2: Users can insert campaigns where they are the master
CREATE POLICY "campaigns_masters_can_insert" ON campaigns
FOR INSERT WITH CHECK (
  auth.uid() = master_id
);

-- Policy 3: Users can update campaigns where they are the master
CREATE POLICY "campaigns_masters_can_update" ON campaigns
FOR UPDATE USING (
  auth.uid() = master_id
) WITH CHECK (
  auth.uid() = master_id
);

-- Policy 4: Users can delete campaigns where they are the master
CREATE POLICY "campaigns_masters_can_delete" ON campaigns
FOR DELETE USING (
  auth.uid() = master_id
);

-- Update table comment
COMMENT ON TABLE campaigns IS 'RLS re-enabled with simple, non-recursive policies. Only masters can access their campaigns.';

-- Note: Player access will be added later with a separate policy for campaign_players table
COMMENT ON COLUMN campaigns.master_id IS 'Only the master (creator) of the campaign can access it directly. Players access through campaign_players table.';
