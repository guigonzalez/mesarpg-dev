-- Add status column to campaigns table for soft delete functionality
-- Migration: Add campaign status column

-- Add status enum type
CREATE TYPE campaign_status AS ENUM ('active', 'archived', 'deleted');

-- Add status column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN status campaign_status DEFAULT 'active' NOT NULL;

-- Create index for better query performance
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Update RLS policies to only show active campaigns by default
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view campaigns they are part of" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can delete their campaigns" ON campaigns;

-- Recreate policies with status filter
CREATE POLICY "Users can view active campaigns they are part of" ON campaigns
FOR SELECT USING (
  status = 'active' AND (
    master_id = auth.uid() OR 
    id IN (
      SELECT campaign_id FROM campaign_players 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

CREATE POLICY "Masters can update their active campaigns" ON campaigns
FOR UPDATE USING (
  status = 'active' AND master_id = auth.uid()
);

CREATE POLICY "Masters can manage status of their campaigns" ON campaigns
FOR UPDATE USING (
  master_id = auth.uid()
) WITH CHECK (
  master_id = auth.uid()
);

CREATE POLICY "Masters can insert campaigns" ON campaigns
FOR INSERT WITH CHECK (
  master_id = auth.uid()
);

-- Add comment for documentation
COMMENT ON COLUMN campaigns.status IS 'Campaign status: active (normal), archived (hidden but accessible), deleted (soft deleted)';
