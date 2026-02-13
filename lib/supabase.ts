import { createClient } from '@supabase/supabase-js';

// Use dummy URL for build time if env vars not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Room = {
  id: string;
  code: string;
  streaming_services: string[];
  created_at: string;
  user1_id?: string;
  user2_id?: string;
};

export type Swipe = {
  id: string;
  room_id: string;
  user_id: string;
  movie_id: string;
  direction: 'left' | 'right';
  created_at: string;
};

export type Match = {
  room_id: string;
  movie_id: string;
  matched_at: string;
};

// Generate a 6-character room code (consonant-vowel pattern for easy reading)
export function generateRoomCode(): string {
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const vowels = 'AEIOU';
  const digits = '23456789';
  
  // Pattern: C-V-C-V-D-D (e.g., MAKO42, RUBY87)
  let code = '';
  code += consonants.charAt(Math.floor(Math.random() * consonants.length));
  code += vowels.charAt(Math.floor(Math.random() * vowels.length));
  code += consonants.charAt(Math.floor(Math.random() * consonants.length));
  code += vowels.charAt(Math.floor(Math.random() * vowels.length));
  code += digits.charAt(Math.floor(Math.random() * digits.length));
  code += digits.charAt(Math.floor(Math.random() * digits.length));
  
  return code;
}

// Create a new room
export async function createRoom(streamingServices: string[]): Promise<string> {
  const code = generateRoomCode();
  const userId = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      code,
      streaming_services: streamingServices,
      user1_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  
  // Store user ID in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(`room_${code}_user`, userId);
  }
  
  return code;
}

// Join an existing room
export async function joinRoom(code: string): Promise<void> {
  const userId = crypto.randomUUID();
  
  const { data: room, error: fetchError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single();

  if (fetchError) throw new Error('Room not found');
  
  // Assign to user2 if available
  if (!room.user2_id) {
    const { error: updateError } = await supabase
      .from('rooms')
      .update({ user2_id: userId })
      .eq('code', code);
    
    if (updateError) throw updateError;
  }
  
  // Store user ID in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(`room_${code}_user`, userId);
  }
}

// Get room details
export async function getRoom(code: string): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single();

  if (error) throw error;
  return data;
}

// Record a swipe
export async function recordSwipe(
  roomId: string,
  userId: string,
  movieId: string,
  direction: 'left' | 'right'
): Promise<void> {
  const { error } = await supabase
    .from('swipes')
    .insert({
      room_id: roomId,
      user_id: userId,
      movie_id: movieId,
      direction,
    });

  if (error) throw error;
}

// Check if there's a match for a movie
export async function checkMatch(
  roomId: string,
  movieId: string
): Promise<boolean> {
  const { data: room } = await supabase
    .from('rooms')
    .select('user1_id, user2_id')
    .eq('id', roomId)
    .single();

  if (!room || !room.user1_id || !room.user2_id) return false;

  // Check if both users swiped right
  const { data: swipes } = await supabase
    .from('swipes')
    .select('*')
    .eq('room_id', roomId)
    .eq('movie_id', movieId)
    .eq('direction', 'right');

  const user1Swiped = swipes?.some(s => s.user_id === room.user1_id) ?? false;
  const user2Swiped = swipes?.some(s => s.user_id === room.user2_id) ?? false;

  return user1Swiped && user2Swiped;
}

// Get all matches for a room
export async function getMatches(roomId: string): Promise<string[]> {
  const { data: room } = await supabase
    .from('rooms')
    .select('user1_id, user2_id')
    .eq('id', roomId)
    .single();

  if (!room || !room.user1_id || !room.user2_id) return [];

  const { data: swipes } = await supabase
    .from('swipes')
    .select('movie_id, user_id')
    .eq('room_id', roomId)
    .eq('direction', 'right');

  if (!swipes) return [];

  // Find movies where both users swiped right
  const movieSwipes: Record<string, Set<string>> = {};
  
  swipes.forEach(swipe => {
    if (!movieSwipes[swipe.movie_id]) {
      movieSwipes[swipe.movie_id] = new Set();
    }
    movieSwipes[swipe.movie_id].add(swipe.user_id);
  });

  const matches = Object.entries(movieSwipes)
    .filter(([_, users]) => users.has(room.user1_id) && users.has(room.user2_id))
    .map(([movieId]) => movieId);

  return matches;
}

// Subscribe to room changes (partner joining)
export function subscribeToRoom(code: string, callback: (room: Room) => void) {
  const channel = supabase
    .channel(`room_${code}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `code=eq.${code}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Room);
        }
      }
    )
    .subscribe();

  return channel;
}

// Subscribe to new matches in real-time
export function subscribeToMatches(roomId: string, callback: (movieId: string) => void) {
  const channel = supabase
    .channel(`matches_${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'swipes',
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        // When a new swipe comes in, check if it creates a match
        const swipe = payload.new as Swipe;
        if (swipe.direction === 'right') {
          const isMatch = await checkMatch(roomId, swipe.movie_id);
          if (isMatch) {
            callback(swipe.movie_id);
          }
        }
      }
    )
    .subscribe();

  return channel;
}
