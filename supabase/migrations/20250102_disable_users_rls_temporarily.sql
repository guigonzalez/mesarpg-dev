-- Temporarily disable RLS on users table for invite acceptance
-- This allows new users to be created when accepting invites

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for own user data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;

-- Add comment explaining temporary state
COMMENT ON TABLE users IS 'RLS temporarily disabled for invite acceptance development. Will be re-enabled with proper policies later.';
