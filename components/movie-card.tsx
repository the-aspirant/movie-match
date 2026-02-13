'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { Movie } from '@/lib/tmdb';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right') => void;
  active: boolean;
}

export default function MovieCard({ movie, onSwipe, active }: MovieCardProps) {
  const [exitX, setExitX] = useState(0);
  const [exiting, setExiting] = useState(false);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Increased threshold for better mobile experience
    const threshold = 120;
    
    if (Math.abs(info.offset.x) > threshold) {
      setExiting(true);
      setExitX(info.offset.x > 0 ? 500 : -500);
      setTimeout(() => {
        onSwipe(info.offset.x > 0 ? 'right' : 'left');
      }, 250);
    }
  };

  // Enhanced swipe indicators with smoother transitions
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, 0], [1, 0]);
  const likeScale = useTransform(x, [0, 150], [0.8, 1.2]);
  const nopeScale = useTransform(x, [-150, 0], [1.2, 0.8]);

  return (
    <motion.div
      className={`absolute inset-0 touch-none ${active ? 'z-10' : 'z-0'}`}
      style={{
        x: exiting ? exitX : x,
        rotate,
        opacity: exiting ? 0 : opacity,
      }}
      drag={active ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={exiting ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: active ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileTap={active ? { cursor: 'grabbing' } : {}}
    >
      <div className="w-full h-full bg-warmGray rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 relative select-none flex flex-col">
        {/* Movie Poster - Now the hero element, takes most space */}
        <div className="relative flex-1">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          {/* Enhanced swipe indicator - Like */}
          <motion.div
            style={{ opacity: likeOpacity, scale: likeScale }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500/50 via-amber-500/30 to-transparent pointer-events-none"
          >
            <div className="bg-amber-500 text-warmDark text-3xl md:text-4xl font-bold px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl rotate-12 shadow-2xl border-4 border-white/20">
              ✓ LIKE
            </div>
          </motion.div>

          {/* Enhanced swipe indicator - Nope */}
          <motion.div
            style={{ opacity: nopeOpacity, scale: nopeScale }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-coral-500/50 via-coral-500/30 to-transparent pointer-events-none"
          >
            <div className="bg-coral-500 text-white text-3xl md:text-4xl font-bold px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl -rotate-12 shadow-2xl border-4 border-white/20">
              ✗ NOPE
            </div>
          </motion.div>

          {/* Gradient overlay for better text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-warmGray via-warmGray/80 to-transparent" />
        </div>

        {/* Movie Info - Compact and clean */}
        <div className="flex-shrink-0 px-4 py-3 md:p-5 space-y-2">
          <div>
            <h3 className="text-lg md:text-xl font-display font-bold text-warmLight leading-tight line-clamp-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-warmLight/60 mt-1">
              <span>{movie.year}</span>
              <span>•</span>
              <span>⭐ {movie.rating}</span>
              <span>•</span>
              <span className="truncate">{movie.genre[0]}</span>
            </div>
          </div>

          {/* Streaming services - minimal, clean */}
          <div className="flex flex-wrap gap-1.5">
            {movie.streamingOn.slice(0, 2).map(service => (
              <span
                key={service}
                className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-medium"
              >
                {service}
              </span>
            ))}
            {movie.streamingOn.length > 2 && (
              <span className="text-xs px-2.5 py-1 bg-warmDark/50 text-warmLight/60 rounded-full">
                +{movie.streamingOn.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
