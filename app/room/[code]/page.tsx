'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRoom, recordSwipe, checkMatch, getMatches, subscribeToRoom } from '@/lib/supabase';
import { fetchMovies, filterMoviesByServices, getMovieById, type Movie, MOCK_MOVIES } from '@/lib/tmdb';
import MovieCard from '@/components/movie-card';
import MatchModal from '@/components/match-modal';
import RoomLobby from '@/components/room-lobby';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMoreMovies, setLoadingMoreMovies] = useState(false);
  const [streamingServices, setStreamingServices] = useState<string[]>([]);

  useEffect(() => {
    async function initializeRoom() {
      try {
        // Get room details
        const room = await getRoom(roomCode);
        setRoomId(room.id);
        setStreamingServices(room.streaming_services);

        // Check if both users are connected
        setPartnerConnected(Boolean(room.user1_id && room.user2_id));

        // Get user ID from localStorage
        const storedUserId = localStorage.getItem(`room_${roomCode}_user`);
        if (!storedUserId) {
          throw new Error('User not found');
        }
        setUserId(storedUserId);

        // Fetch initial movies from TMDB or mock data
        const fetchedMovies = await fetchMovies(1);
        
        // Filter by streaming services if specified
        const filteredMovies = filterMoviesByServices(fetchedMovies, room.streaming_services);
        
        setMovies(filteredMovies);

        // Get existing matches
        const existingMatches = await getMatches(room.id);
        setMatches(existingMatches);

        setLoading(false);

        // Subscribe to room changes
        const subscription = subscribeToRoom(roomCode, (updatedRoom) => {
          setPartnerConnected(Boolean(updatedRoom.user1_id && updatedRoom.user2_id));
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error(err);
        setError('Failed to load room');
        setLoading(false);
      }
    }

    if (roomCode) {
      initializeRoom();
    }
  }, [roomCode]);

  // Load more movies when running low
  useEffect(() => {
    async function loadMoreMovies() {
      // Load more when 5 movies remaining
      if (currentIndex >= movies.length - 5 && !loadingMoreMovies) {
        setLoadingMoreMovies(true);
        
        try {
          const nextPage = currentPage + 1;
          const newMovies = await fetchMovies(nextPage);
          
          // Filter by streaming services
          const filteredNewMovies = filterMoviesByServices(newMovies, streamingServices);
          
          // Avoid duplicates
          const existingIds = new Set(movies.map(m => m.id));
          const uniqueNewMovies = filteredNewMovies.filter(m => !existingIds.has(m.id));
          
          setMovies(prev => [...prev, ...uniqueNewMovies]);
          setCurrentPage(nextPage);
        } catch (error) {
          console.error('Failed to load more movies:', error);
        } finally {
          setLoadingMoreMovies(false);
        }
      }
    }

    if (partnerConnected && movies.length > 0) {
      loadMoreMovies();
    }
  }, [currentIndex, movies.length, currentPage, loadingMoreMovies, partnerConnected, streamingServices]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!roomId || !userId || currentIndex >= movies.length) return;

    const movie = movies[currentIndex];

    try {
      // Record the swipe
      await recordSwipe(roomId, userId, movie.id, direction);

      // If swiped right, check for match
      if (direction === 'right') {
        const isMatch = await checkMatch(roomId, movie.id);
        if (isMatch) {
          setMatchedMovie(movie);
          setMatches(prev => [...prev, movie.id]);
        }
      }

      // Move to next movie
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }
  };

  const handleCloseMatch = () => {
    setMatchedMovie(null);
  };

  const toggleMatches = () => {
    setShowMatches(!showMatches);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ height: '100dvh' }}>
        <div className="text-center space-y-4">
          <div className="animate-spin text-6xl">🎬</div>
          <p className="text-warmLight/60">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-4" style={{ height: '100dvh' }}>
        <div className="card text-center space-y-4 max-w-md w-full">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-2xl font-display font-bold text-warmLight">{error}</h2>
          <button onClick={() => router.push('/')} className="btn-primary w-full">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!partnerConnected) {
    return <RoomLobby roomCode={roomCode} />;
  }

  if (currentIndex >= movies.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 overflow-y-auto" style={{ minHeight: '100dvh' }}>
        <div className="max-w-md w-full py-6">
          <div className="card text-center space-y-5">
            <div className="text-5xl md:text-6xl">🎬</div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-warmLight">
              All Done!
            </h2>
            <p className="text-warmLight/60 text-sm md:text-base">
              You've gone through all movies. Check your matches below!
            </p>

            {matches.length > 0 ? (
              <div className="space-y-4">
                <p className="text-amber-400 font-semibold text-base md:text-lg">
                  {matches.length} Match{matches.length !== 1 ? 'es' : ''} 🍿
                </p>
                <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                  {matches.map(movieId => {
                    const movie = getMovieById(movieId);
                    return movie ? (
                      <div key={movieId} className="relative">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg active:scale-95 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent rounded-lg flex items-end p-1.5 md:p-2">
                          <p className="text-white text-[10px] md:text-xs font-semibold line-clamp-2 leading-tight">
                            {movie.title}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ) : (
              <p className="text-warmLight/60 text-sm md:text-base">No matches yet. Try again with different preferences!</p>
            )}

            <button onClick={() => router.push('/')} className="btn-primary w-full">
              Start New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden relative" style={{ height: '100dvh' }}>
      {/* Header - Clean and compact */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 py-2 md:p-4 bg-gradient-to-b from-warmDark/95 to-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-warmLight/60 active:text-warmLight transition-colors min-h-[44px] px-2 text-sm"
          >
            ← Exit
          </button>

          <div className="flex items-center gap-2">
            <div className="text-xs md:text-sm text-warmLight/60 px-2.5 py-1.5 bg-warmGray/50 backdrop-blur-sm rounded-full">
              {currentIndex + 1}/{movies.length}
              {loadingMoreMovies && <span className="ml-1">⏳</span>}
            </div>
            <button
              onClick={toggleMatches}
              className="relative px-3 py-1.5 min-h-[44px] bg-warmGray/50 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium text-warmLight active:scale-95 transition-all"
            >
              💕 {matches.length > 0 ? matches.length : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Main swipe area - Optimized for mobile */}
      <div className="h-full flex items-center justify-center px-4 pt-16 pb-24">
        <div className="relative w-full max-w-md" style={{ height: 'min(calc(100dvh - 10rem), 600px)' }}>
          {/* Render cards in reverse order so the top card is interactive */}
          {movies.slice(currentIndex, currentIndex + 3).reverse().map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSwipe={handleSwipe}
              active={index === 2} // Only the top card is active
            />
          ))}

          {movies.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎬</div>
                <p className="text-warmLight/60">No movies available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons - Touch-friendly, better positioned */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 bg-gradient-to-t from-warmDark/95 via-warmDark/50 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto flex items-center justify-center gap-6 md:gap-8 pointer-events-auto">
          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-coral-500 active:bg-coral-600 text-white text-xl md:text-2xl shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center"
            aria-label="Swipe left"
          >
            ✕
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-amber-500 to-gold-500 active:from-amber-600 active:to-gold-600 text-white text-2xl md:text-3xl shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center"
            aria-label="Swipe right"
          >
            ❤️
          </button>
        </div>
      </div>

      {/* Match modal */}
      {matchedMovie && (
        <MatchModal movie={matchedMovie} onClose={handleCloseMatch} />
      )}

      {/* Matches overlay - Mobile optimized */}
      {showMatches && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center"
          onClick={toggleMatches}
        >
          <div
            className="card max-w-md w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col rounded-b-none sm:rounded-3xl m-0 sm:m-4"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
          >
            {/* Fixed header - Compact */}
            <div className="flex-shrink-0 pb-3 border-b border-warmDark/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-display font-bold text-warmLight">
                  Your Matches
                </h3>
                <button
                  onClick={toggleMatches}
                  className="text-warmLight/60 active:text-warmLight text-xl min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                  aria-label="Close matches"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain pt-3 -mr-2 pr-2">
              <div className="space-y-2.5 pb-4">
                {matches.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-3">💔</div>
                    <p className="text-warmLight/60 text-base font-medium">No matches yet</p>
                    <p className="text-sm text-warmLight/40 mt-2 px-6">
                      Keep swiping to find movies you both love!
                    </p>
                  </div>
                ) : (
                  matches.map(movieId => {
                    const movie = getMovieById(movieId);
                    return movie ? (
                      <div key={movieId} className="flex gap-3 p-3 bg-warmDark rounded-xl active:bg-warmDark/80 transition-colors">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-lg shadow-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <h4 className="font-display font-bold text-warmLight text-sm md:text-base leading-tight line-clamp-2">
                            {movie.title}
                          </h4>
                          <p className="text-xs md:text-sm text-warmLight/60">
                            {movie.year} • ⭐ {movie.rating}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {movie.streamingOn.slice(0, 2).map(service => (
                              <span
                                key={service}
                                className="text-[10px] md:text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30"
                              >
                                {service}
                              </span>
                            ))}
                            {movie.streamingOn.length > 2 && (
                              <span className="text-[10px] md:text-xs px-2 py-0.5 bg-warmGray text-warmLight/60 rounded-full">
                                +{movie.streamingOn.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
