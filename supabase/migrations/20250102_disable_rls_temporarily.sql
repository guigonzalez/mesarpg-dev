-- Temporary fix: Disable RLS completely to resolve infinite recursion
-- This is a temporary solution to get the app working

-- Completely disable RLS on campaigns table
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
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
DROP POLICY IF EXISTS "campaigns_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_policy" ON campaigns;

-- Add comment explaining temporary state
COMMENT ON TABLE campaigns IS 'RLS temporarily disabled due to infinite recursion. Will be re-enabled with proper policies later.';
