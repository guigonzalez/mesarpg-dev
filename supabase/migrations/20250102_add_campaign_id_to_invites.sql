-- Add campaign_id column to invites table
-- This allows invites to be associated with specific campaigns

-- Add campaign_id column
ALTER TABLE invites ADD COLUMN campaign_id UUID;

-- Add foreign key constraint
ALTER TABLE invites ADD CONSTRAINT invites_campaign_id_fkey 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_invites_campaign_id ON invites(campaign_id);

-- Update existing invites to have a null campaign_id (they will need to be recreated)
COMMENT ON COLUMN invites.campaign_id IS 'Campaign that this invite is for. Required for new invites.';
