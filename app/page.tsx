'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, joinRoom } from '@/lib/supabase';
import { STREAMING_SERVICES } from '@/lib/tmdb';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'welcome' | 'create' | 'join'>('welcome');
  const [roomCode, setRoomCode] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one streaming service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const code = await createRoom(selectedServices);
      router.push(`/room/${code}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinRoom(roomCode.toUpperCase());
      router.push(`/room/${roomCode.toUpperCase()}`);
    } catch (err) {
      setError('Room not found. Check your code and try again.');
      setLoading(false);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-12" style={{ minHeight: '100dvh' }}>
      <div className="max-w-md w-full flex-shrink-0">
        {mode === 'welcome' && (
          <div className="text-center space-y-8 md:space-y-10 animate-in fade-in duration-500">
            {/* Hero icon */}
            <div className="text-7xl md:text-8xl">🎬</div>

            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-amber-400 to-coral-400 bg-clip-text text-transparent">
                Movie Match
              </h1>
              <p className="text-warmLight/80 text-lg md:text-xl">
                Swipe together. Watch together.
              </p>
              <p className="text-warmLight/50 text-sm max-w-xs mx-auto">
                Like Tinder, but for deciding what to watch tonight.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => setMode('create')}
                className="btn-primary w-full text-lg"
              >
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                className="btn-secondary w-full text-lg"
              >
                Join Room
              </button>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center">
              <div className="space-y-2">
                <div className="text-3xl">💕</div>
                <p className="text-xs text-warmLight/50">Both swipe</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">✨</div>
                <p className="text-xs text-warmLight/50">Find matches</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">🍿</div>
                <p className="text-xs text-warmLight/50">Watch tonight</p>
              </div>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
            {/* Back button */}
            <button
              onClick={() => setMode('welcome')}
              className="text-amber-400 active:text-amber-300 flex items-center gap-2 text-sm md:text-base min-h-[44px]"
            >
              <span>←</span> Back
            </button>

            <div className="card space-y-5 md:space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-warmLight mb-2">
                  Create a Room
                </h2>
                <p className="text-warmLight/60 text-xs md:text-sm">
                  Select your streaming services
                </p>
              </div>

              {/* Streaming services grid - Touch-friendly */}
              <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                {STREAMING_SERVICES.map(service => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-3 md:p-4 min-h-[56px] md:min-h-[60px] rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                      selectedServices.includes(service)
                        ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'bg-warmDark/50 border-warmGray active:border-amber-500/50'
                    }`}
                  >
                    <div className="font-medium text-warmLight text-sm md:text-base">{service}</div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="text-coral-400 text-xs md:text-sm text-center bg-coral-500/10 p-2.5 md:p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleCreateRoom}
                disabled={loading || selectedServices.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? 'Creating...' : 'Create Room & Get Code'}
              </button>

              <p className="text-[10px] md:text-xs text-warmLight/40 text-center">
                You'll get a code to share with your partner
              </p>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
            {/* Back button */}
            <button
              onClick={() => setMode('welcome')}
              className="text-amber-400 active:text-amber-300 flex items-center gap-2 text-sm md:text-base min-h-[44px]"
            >
              <span>←</span> Back
            </button>

            <div className="card space-y-5 md:space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-warmLight mb-2">
                  Join a Room
                </h2>
                <p className="text-warmLight/60 text-xs md:text-sm">
                  Enter the code your partner shared
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                <input
                  type="text"
                  placeholder="WOLF42"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full text-center text-xl md:text-2xl tracking-widest font-bold uppercase"
                  maxLength={6}
                />

                {error && (
                  <div className="text-coral-400 text-xs md:text-sm text-center bg-coral-500/10 p-2.5 md:p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleJoinRoom}
                  disabled={loading || !roomCode.trim()}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>

              <div className="pt-3 md:pt-4 border-t border-warmGray">
                <p className="text-[10px] md:text-xs text-warmLight/40 text-center">
                  Room codes are 6 characters long
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
