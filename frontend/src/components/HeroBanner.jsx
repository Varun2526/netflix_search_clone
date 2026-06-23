import React, { useState, useEffect } from 'react';
import { Info, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addToWishlist } from '../api';

export default function HeroBanner({ items = [], onSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishStatus, setWishStatus] = useState('idle'); // idle | adding | added | error

  // reset the watchlist button state when the slide changes
  useEffect(() => { setWishStatus('idle'); }, [currentIndex]);

  if (!items || items.length === 0) {
    return <div className="relative h-[85vh] w-full bg-background" />;
  }

  const item = items[currentIndex];
  // Prefer a landscape banner; fall back to the (portrait) poster.
  const bgImage = item.bannerImage || item.posterImage;
  // Posters are portrait, so anchor to the top to avoid an awkward middle crop.
  const bgPosition = item.bannerImage ? 'center' : 'top';

  const handleWishlist = async () => {
    if (!item?._id) return;
    setWishStatus('adding');
    try {
      await addToWishlist(item._id);
      setWishStatus('added');
      setTimeout(() => setWishStatus('idle'), 2500);
    } catch {
      setWishStatus('error');
      setTimeout(() => setWishStatus('idle'), 2500);
    }
  };

  return (
    <div className="relative h-[85vh] w-full flex items-center justify-start overflow-hidden">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url("${bgImage}")`,
              backgroundPosition: bgPosition,
              filter: 'brightness(0.8)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 mt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="inline-block px-3 py-1 rounded-full border border-primary/50 bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-6 backdrop-blur-sm uppercase">
              Featured {item.type || 'Content'}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter drop-shadow-lg">
              {item.title}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl line-clamp-3 drop-shadow-md">
              {item.description || 'Experience the next great adventure right here.'}
            </p>

            <div className="flex items-center gap-6 mb-10 text-sm font-medium text-foreground/80 drop-shadow-md">
              <span>{item.year || ''}</span>
              {item.genres && item.genres.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-primary/50" />
                  <span>{item.genres.slice(0, 2).join(', ')}</span>
                </>
              )}
              {item.rating > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-primary/50" />
                  <span className="flex items-center gap-1">
                    <span className="text-primary font-bold text-base">{(item.rating / 2).toFixed(1)}</span>
                    <span className="text-muted-foreground">/5</span>
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect?.(item)}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-lg font-semibold transition-colors shadow-lg shadow-primary/20"
              >
                <Info className="w-5 h-5" />
                View Details
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWishlist}
                disabled={wishStatus === 'adding' || wishStatus === 'added'}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 px-8 py-3.5 rounded-lg font-semibold transition-all backdrop-blur-sm disabled:opacity-70"
              >
                {wishStatus === 'added' ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
                {wishStatus === 'adding' ? 'Adding…' : wishStatus === 'added' ? 'Added to Watchlist' : wishStatus === 'error' ? 'Try again' : 'Add to Watchlist'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-16 md:bottom-32 left-0 right-0 z-20 flex justify-center gap-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-10 bg-primary shadow-lg shadow-primary/50' : 'w-6 bg-white/30 hover:bg-white/50'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
