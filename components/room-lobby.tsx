'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RoomLobbyProps {
  roomCode: string;
  onReady?: () => void;
}

export default function RoomLobby({ roomCode, onReady }: RoomLobbyProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ minHeight: '100dvh' }}>
      <div className="max-w-md w-full">
        <div className="card space-y-6 md:space-y-8 text-center">
          {/* Waiting animation */}
          <div className="relative mx-auto w-24 h-24 md:w-32 md:h-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-500/20 to-coral-500/20 flex items-center justify-center text-3xl md:text-4xl"
            >
              💕
            </motion.div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-warmLight">
              Waiting for Partner
            </h2>
            <p className="text-warmLight/60 text-sm md:text-base">
              Share this code with your partner
            </p>
          </div>

          {/* Room code display - Enhanced and prominent */}
          <div className="space-y-3">
            <div
              onClick={copyCode}
              className="card bg-warmDark cursor-pointer active:scale-95 transition-all duration-200 group relative overflow-hidden"
            >
              {/* Animated background glow */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-coral-500/10 to-amber-500/10"
              />
              
              <div className="relative py-2">
                <div className="text-5xl md:text-6xl font-bold tracking-[0.3em] text-amber-400 group-active:text-amber-300 transition-colors">
                  {roomCode}
                </div>
                <motion.div 
                  className="text-xs md:text-sm text-warmLight/60 mt-2 md:mt-3 font-medium"
                  animate={{ opacity: copied ? 1 : 0.6 }}
                >
                  {copied ? '✓ Copied to clipboard!' : 'Tap to copy'}
                </motion.div>
              </div>
            </div>

            <button
              onClick={copyCode}
              className="btn-secondary w-full text-sm md:text-base"
            >
              📋 Copy Code
            </button>
          </div>

          {/* Instructions */}
          <div className="space-y-2.5 pt-4 md:pt-6 border-t border-warmGray">
            <p className="text-xs md:text-sm text-warmLight/60">
              How it works:
            </p>
            <div className="space-y-1.5 text-xs md:text-sm text-warmLight/80 text-left max-w-xs mx-auto">
              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 flex-shrink-0">1.</span>
                <span>Share the code with your partner</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 flex-shrink-0">2.</span>
                <span>Both of you swipe on movies</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 flex-shrink-0">3.</span>
                <span>When you both swipe right → Match! 🎉</span>
              </div>
            </div>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-amber-500"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
