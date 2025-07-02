-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('master', 'player');
CREATE TYPE campaign_system AS ENUM ('D&D 5e', 'Vampiro: A Máscara', 'Livre');
CREATE TYPE token_type AS ENUM ('player', 'npc');
CREATE TYPE message_type AS ENUM ('player', 'master', 'system', 'dice');
CREATE TYPE handout_type AS ENUM ('text', 'image', 'pdf');
CREATE TYPE field_type AS ENUM ('text', 'number', 'boolean', 'textarea', 'image');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'player',
  sheet_data JSONB DEFAULT '[]',
  token_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  system campaign_system NOT NULL DEFAULT 'Livre',
  master_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sheet_template JSONB NOT NULL DEFAULT '{"name": "Livre", "fields": []}',
  active_map_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign players (many-to-many relationship)
CREATE TABLE public.campaign_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- Maps table
CREATE TABLE public.maps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  background_url TEXT NOT NULL,
  grid_size INTEGER DEFAULT 20,
  scale DECIMAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tokens table
CREATE TABLE public.tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID NOT NULL, -- Can reference users.id or npcs.id
  type token_type NOT NULL,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NPCs table
CREATE TABLE public.npcs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  sheet JSONB DEFAULT '[]',
  token_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  type message_type NOT NULL DEFAULT 'player',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handouts table
CREATE TABLE public.handouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type handout_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  shared_with_players BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Markers table
CREATE TABLE public.markers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT '#ff0000',
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drawing lines table
CREATE TABLE public.drawing_lines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  color TEXT NOT NULL DEFAULT '#000000',
  points JSONB NOT NULL DEFAULT '[]', -- Array of {x, y} coordinates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fog of war table
CREATE TABLE public.fog_of_war (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, position_x, position_y)
);

-- Add foreign key constraint for active_map_id after maps table is created
ALTER TABLE public.campaigns 
ADD CONSTRAINT fk_campaigns_active_map 
FOREIGN KEY (active_map_id) REFERENCES public.maps(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_campaigns_master_id ON public.campaigns(master_id);
CREATE INDEX idx_campaign_players_campaign_id ON public.campaign_players(campaign_id);
CREATE INDEX idx_campaign_players_user_id ON public.campaign_players(user_id);
CREATE INDEX idx_tokens_campaign_id ON public.tokens(campaign_id);
CREATE INDEX idx_tokens_owner_id ON public.tokens(owner_id);
CREATE INDEX idx_chat_messages_campaign_id ON public.chat_messages(campaign_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_maps_campaign_id ON public.maps(campaign_id);
CREATE INDEX idx_npcs_campaign_id ON public.npcs(campaign_id);
CREATE INDEX idx_handouts_campaign_id ON public.handouts(campaign_id);
CREATE INDEX idx_markers_campaign_id ON public.markers(campaign_id);
CREATE INDEX idx_drawing_lines_campaign_id ON public.drawing_lines(campaign_id);
CREATE INDEX idx_fog_of_war_campaign_id ON public.fog_of_war(campaign_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawing_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fog_of_war ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Campaigns policies
CREATE POLICY "Users can view campaigns they participate in" ON public.campaigns
  FOR SELECT USING (
    auth.uid() = master_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = id AND status = 'active'
    )
  );

CREATE POLICY "Masters can manage their campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = master_id);

-- Campaign players policies
CREATE POLICY "Users can view campaign players for their campaigns" ON public.campaign_players
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    ) OR
    auth.uid() = user_id
  );

CREATE POLICY "Masters can manage campaign players" ON public.campaign_players
  FOR ALL USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

-- Maps policies
CREATE POLICY "Campaign participants can view maps" ON public.maps
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
      UNION
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = maps.campaign_id AND status = 'active'
    )
  );

CREATE POLICY "Masters can manage maps" ON public.maps
  FOR ALL USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

-- Tokens policies
CREATE POLICY "Campaign participants can view tokens" ON public.tokens
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
      UNION
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = tokens.campaign_id AND status = 'active'
    )
  );

CREATE POLICY "Masters can manage all tokens" ON public.tokens
  FOR ALL USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

CREATE POLICY "Players can manage their own tokens" ON public.tokens
  FOR ALL USING (
    type = 'player' AND 
    owner_id = auth.uid() AND
    auth.uid() IN (
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = tokens.campaign_id AND status = 'active'
    )
  );

-- Chat messages policies
CREATE POLICY "Campaign participants can view chat messages" ON public.chat_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
      UNION
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = chat_messages.campaign_id AND status = 'active'
    )
  );

CREATE POLICY "Campaign participants can send chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
      UNION
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = chat_messages.campaign_id AND status = 'active'
    )
  );

-- NPCs policies
CREATE POLICY "Campaign participants can view NPCs" ON public.npcs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
      UNION
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = npcs.campaign_id AND status = 'active'
    )
  );

CREATE POLICY "Masters can manage NPCs" ON public.npcs
  FOR ALL USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

-- Handouts policies
CREATE POLICY "Campaign participants can view shared handouts" ON public.handouts
  FOR SELECT USING (
    shared_with_players = true AND
    auth.uid() IN (
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = handouts.campaign_id AND status = 'active'
    )
  );

CREATE POLICY "Masters can view all handouts" ON public.handouts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

CREATE POLICY "Masters can manage handouts" ON public.handouts
  FOR ALL USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

-- Markers policies
CREATE POLICY "Campaign participants can view markers" ON public.markers
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
      UNION
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = markers.campaign_id AND status = 'active'
    )
  );

CREATE POLICY "Masters can manage markers" ON public.markers
  FOR ALL USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

-- Drawing lines policies
CREATE POLICY "Campaign participants can view drawing lines" ON public.drawing_lines
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
      UNION
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = drawing_lines.campaign_id AND status = 'active'
    )
  );

CREATE POLICY "Masters can manage drawing lines" ON public.drawing_lines
  FOR ALL USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

-- Fog of war policies
CREATE POLICY "Campaign participants can view fog of war" ON public.fog_of_war
  FOR SELECT USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
      UNION
      SELECT user_id FROM public.campaign_players 
      WHERE campaign_id = fog_of_war.campaign_id AND status = 'active'
    )
  );

CREATE POLICY "Masters can manage fog of war" ON public.fog_of_war
  FOR ALL USING (
    auth.uid() IN (
      SELECT master_id FROM public.campaigns WHERE id = campaign_id
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maps_updated_at BEFORE UPDATE ON public.maps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at BEFORE UPDATE ON public.tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_npcs_updated_at BEFORE UPDATE ON public.npcs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_handouts_updated_at BEFORE UPDATE ON public.handouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for real-time features
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.markers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawing_lines;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fog_of_war;
