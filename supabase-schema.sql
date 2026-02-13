-- Movie Match Database Schema for Supabase

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  streaming_services TEXT[] NOT NULL,
  user1_id UUID,
  user2_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rooms
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  movie_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for swipes
CREATE INDEX IF NOT EXISTS idx_swipes_room_movie ON swipes(room_id, movie_id);
CREATE INDEX IF NOT EXISTS idx_swipes_user ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_room_user_movie ON swipes(room_id, user_id, movie_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Policies for rooms (allow all for MVP - customize as needed)
CREATE POLICY "Allow public read on rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on rooms" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on rooms" ON rooms
  FOR UPDATE USING (true);

-- Policies for swipes (allow all for MVP - customize as needed)
CREATE POLICY "Allow public read on swipes" ON swipes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on swipes" ON swipes
  FOR INSERT WITH CHECK (true);

-- Enable Realtime for rooms table
-- Note: You also need to enable this in Supabase Dashboard > Database > Replication
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Comments
COMMENT ON TABLE rooms IS 'Stores movie swiping session rooms with codes';
COMMENT ON TABLE swipes IS 'Stores individual swipe actions (left/right) for each user in a room';
COMMENT ON COLUMN rooms.code IS '6-character alphanumeric room code';
COMMENT ON COLUMN rooms.streaming_services IS 'Array of streaming platforms selected for this room';
COMMENT ON COLUMN swipes.direction IS 'Swipe direction: left (dislike) or right (like)';
