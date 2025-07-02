-- Emergency fix for infinite recursion in campaign policies
-- This migration completely removes problematic policies and creates simple ones

-- Disable RLS temporarily to fix the issue
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view campaigns they are part of" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can delete their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view active campaigns they are part of" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can manage status of their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Enable read access for campaign participants" ON campaigns;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON campaigns;
DROP POLICY IF EXISTS "Enable update for campaign masters" ON campaigns;

-- Re-enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "campaigns_select_policy" ON campaigns
FOR SELECT USING (
  auth.uid() = master_id
);

CREATE POLICY "campaigns_insert_policy" ON campaigns
FOR INSERT WITH CHECK (
  auth.uid() = master_id
);

CREATE POLICY "campaigns_update_policy" ON campaigns
FOR UPDATE USING (
  auth.uid() = master_id
);

CREATE POLICY "campaigns_delete_policy" ON campaigns
FOR DELETE USING (
  auth.uid() = master_id
);
