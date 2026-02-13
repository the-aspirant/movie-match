'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Movie } from '@/lib/tmdb';

interface MatchModalProps {
  movie: Movie;
  onClose: () => void;
}

export default function MatchModal({ movie, onClose }: MatchModalProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Trigger confetti celebration
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#fb7185', '#f43f5e'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#fb7185', '#f43f5e'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card relative overflow-hidden">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-coral-500/20 to-gold-500/20 animate-match-glow" />
              
              <div className="relative z-10 text-center space-y-4 md:space-y-6 p-5 md:p-8">
                {/* Match header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <div className="text-5xl md:text-6xl mb-3 md:mb-4">✨💕✨</div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-amber-400 to-coral-400 bg-clip-text text-transparent">
                    It's a Match!
                  </h2>
                </motion.div>

                {/* Movie poster */}
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 360 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="relative mx-auto w-40 h-60 md:w-48 md:h-72 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-2 md:border-4 border-amber-500/50"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Movie details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-1"
                >
                  <h3 className="text-xl md:text-2xl font-display font-bold text-warmLight leading-tight px-2">
                    {movie.title}
                  </h3>
                  <p className="text-sm md:text-base text-warmLight/60">
                    {movie.year} • ⭐ {movie.rating}
                  </p>
                </motion.div>

                {/* Streaming info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-2"
                >
                  <p className="text-xs md:text-sm text-warmLight/80">Watch on:</p>
                  <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                    {movie.streamingOn.map(service => (
                      <span
                        key={service}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/50 font-medium text-xs md:text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Celebration text */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="text-xl md:text-2xl font-display font-bold text-amber-400"
                >
                  Watch Tonight! 🍿
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="space-y-2 md:space-y-3 pt-2 md:pt-4"
                >
                  <button
                    onClick={handleClose}
                    className="btn-primary w-full text-sm md:text-base"
                  >
                    🍿 Keep Swiping
                  </button>
                  <p className="text-xs text-warmLight/40">
                    Tap anywhere to close
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
