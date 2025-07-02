-- Temporarily disable RLS on campaign_players table for development
-- This allows us to implement player management functionality without RLS issues

-- Disable RLS on campaign_players table
ALTER TABLE campaign_players DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on campaign_players
DROP POLICY IF EXISTS "Users can view campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Users can insert campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Users can update campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Users can delete campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Masters can manage campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Players can view their own records" ON campaign_players;

-- Add comment explaining temporary state
COMMENT ON TABLE campaign_players IS 'RLS temporarily disabled for player management development. Will be re-enabled with proper policies later.';
