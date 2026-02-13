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
      console.error('Create room error:', err);
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-sm">

        {/* ── WELCOME ── */}
        {mode === 'welcome' && (
          <div className="flex flex-col items-center">
            {/* Hero — big, breathing, unmissable */}
            <div className="text-8xl mb-8">🎬</div>

            <h1 className="text-6xl font-display font-bold bg-gradient-to-r from-amber-400 via-coral-400 to-amber-400 bg-clip-text text-transparent text-center leading-tight">
              Movie<br/>Match
            </h1>

            <p className="mt-4 text-warmLight/70 text-lg text-center leading-relaxed">
              Swipe together. Watch together.
            </p>

            {/* CTA buttons — generous spacing, clear hierarchy */}
            <div className="w-full mt-12 space-y-4">
              <button
                onClick={() => setMode('create')}
                className="btn-primary w-full text-lg py-5"
              >
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full text-lg py-4 text-amber-400 font-medium rounded-full border-2 border-amber-500/40 active:border-amber-500 active:scale-[0.98]"
              >
                Join Room
              </button>
            </div>

            {/* Subtle footer — doesn't compete */}
            <p className="mt-10 text-warmLight/30 text-xs text-center">
              Like Tinder, but for deciding what to watch tonight.
            </p>
          </div>
        )}

        {/* ── CREATE ROOM ── */}
        {mode === 'create' && (
          <div>
            <button
              onClick={() => { setMode('welcome'); setError(''); }}
              className="text-amber-400 active:text-amber-300 flex items-center gap-2 text-sm min-h-[44px] mb-6"
            >
              ← Back
            </button>

            <h2 className="text-3xl font-display font-bold text-warmLight mb-2">
              Pick your services
            </h2>
            <p className="text-warmLight/50 text-sm mb-8">
              We'll show movies available on these platforms.
            </p>

            {/* Services grid — big tap targets, clear states */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {STREAMING_SERVICES.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`py-4 px-4 rounded-xl border-2 font-medium text-base active:scale-[0.97] ${
                    selectedServices.includes(service)
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-warmGray border-warmLight/25 text-warmLight/90'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>

            {error && (
              <div className="text-coral-400 text-sm text-center bg-coral-500/10 p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateRoom}
              disabled={loading || selectedServices.length === 0}
              className="btn-primary w-full text-base py-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>

            <p className="text-warmLight/30 text-xs text-center mt-4">
              You'll get a code to share with your partner.
            </p>
          </div>
        )}

        {/* ── JOIN ROOM ── */}
        {mode === 'join' && (
          <div>
            <button
              onClick={() => { setMode('welcome'); setError(''); }}
              className="text-amber-400 active:text-amber-300 flex items-center gap-2 text-sm min-h-[44px] mb-6"
            >
              ← Back
            </button>

            <h2 className="text-3xl font-display font-bold text-warmLight mb-2">
              Enter the code
            </h2>
            <p className="text-warmLight/50 text-sm mb-8">
              Your partner's room code — 6 characters.
            </p>

            <input
              type="text"
              placeholder="WOLF42"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full text-center text-3xl tracking-[0.3em] font-bold uppercase py-5 mb-6 rounded-2xl"
              maxLength={6}
              autoFocus
            />

            {error && (
              <div className="text-coral-400 text-sm text-center bg-coral-500/10 p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleJoinRoom}
              disabled={loading || !roomCode.trim()}
              className="btn-primary w-full text-base py-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
