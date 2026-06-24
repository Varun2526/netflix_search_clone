import React, { useState, useEffect } from 'react';
import { Info, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addToWishlist } from '../api';

export default function HeroBanner({ items = [], onSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishStatus, setWishStatus] = useState('idle'); // idle | adding | added | error

  // reset the watchlist button state when the slide changes
  useEffect(() => { setWishStatus('idle'); }, [currentIndex]);

  const goPrev = () => setCurrentIndex((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % items.length);

  if (!items || items.length === 0) {
    return <div className="relative h-[85vh] w-full bg-background" />;
  }

  const item = items[currentIndex];
  // The stored banner is Steam's washed-out "storepagebackground" art. Derive
  // the vivid landscape hero art (library_hero.jpg) from the Steam app id;
  // fall back to the banner/poster on error.
  const posterSrc = item.posterImage || item.posterUrl;
  const m = (posterSrc && posterSrc.match(/\/apps\/(\d+)\//)) ||
            (item.bannerImage && item.bannerImage.match(/\/app\/(\d+)/)) || [];
  const steamAppId = m[1];
  const heroImg = steamAppId
    ? `https://steamcdn-a.akamaihd.net/steam/apps/${steamAppId}/library_hero.jpg`
    : (item.bannerImage || posterSrc);
  const fallbackImg = item.bannerImage || posterSrc;
  // Posters are portrait → anchor to top; landscape hero art → center.
  const objectPos = item.type === 'movie' ? 'top' : 'center';

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
          <img
            src={heroImg}
            alt=""
            onError={(e) => {
              if (e.currentTarget.dataset.fb !== '1' && fallbackImg) {
                e.currentTarget.dataset.fb = '1';
                e.currentTarget.src = fallbackImg;
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: objectPos, filter: 'brightness(0.95)' }}
          />
          {/* lighter gradients so the image stays clearly visible on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
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
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
              <span className="text-primary text-[11px] font-semibold tracking-[0.28em] uppercase">
                Spotlight · {item.type || 'Content'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-5 tracking-tight leading-[0.95] drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]">
              {item.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-xl line-clamp-3 drop-shadow-md">
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

      {/* Prev / Next arrows — manually flip the featured item */}
      {items.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 border border-white/15 flex items-center justify-center text-white backdrop-blur-md hover:bg-black/70 hover:border-primary/50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 border border-white/15 flex items-center justify-center text-white backdrop-blur-md hover:bg-black/70 hover:border-primary/50 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

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
