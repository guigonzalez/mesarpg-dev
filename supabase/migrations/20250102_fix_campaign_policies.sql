-- Fix infinite recursion in campaign policies
-- Migration: Fix RLS policies for campaigns table

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view active campaigns they are part of" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can manage status of their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can insert campaigns" ON campaigns;

-- Recreate policies without recursion
CREATE POLICY "Enable read access for campaign participants" ON campaigns
FOR SELECT USING (
  master_id = auth.uid() OR 
  id IN (
    SELECT campaign_id FROM campaign_players 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Enable insert for authenticated users" ON campaigns
FOR INSERT WITH CHECK (
  master_id = auth.uid()
);

CREATE POLICY "Enable update for campaign masters" ON campaigns
FOR UPDATE USING (
  master_id = auth.uid()
) WITH CHECK (
  master_id = auth.uid()
);

-- Add comment for documentation
COMMENT ON COLUMN campaigns.status IS 'Campaign status: active (normal), archived (hidden but accessible), deleted (soft deleted)';
