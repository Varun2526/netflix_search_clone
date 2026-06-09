import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, Check, Star } from 'lucide-react';
import { addToHistory, addToWishlist, rateContent } from '../api';

export default function ContentDetailsModal({ item, isOpen, onClose }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!isOpen || !item) return null;

  const handlePlay = async () => {
    setLoadingAction('play');
    try {
      await addToHistory(item._id);
      alert('Added to history / Playing!');
    } catch (err) {
      console.error('Failed to add to history', err);
      alert('Failed to add to history');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleWishlist = async () => {
    setLoadingAction('wishlist');
    try {
      await addToWishlist(item._id);
      alert('Added to wishlist!');
    } catch (err) {
      console.error('Failed to add to wishlist', err);
      alert('Failed to add to wishlist');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRate = async (score) => {
    setLoadingAction('rate');
    try {
      await rateContent(item._id, score);
      setUserRating(score);
      alert('Rating submitted successfully!');
    } catch (err) {
      console.error('Failed to submit rating', err);
      alert('Failed to submit rating');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-3xl"
          onClick={onClose}
        />
        
        {/* Modal Body */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/50 z-10 flex flex-col md:flex-row h-[85vh] md:h-[600px]"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-black/80 hover:border-white/30 transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Left Column - Poster */}
          <div className="w-full md:w-[40%] h-64 md:h-full relative shrink-0">
            <img 
              src={item.posterUrl} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent md:bg-gradient-to-r md:from-transparent md:to-card" />
          </div>

          {/* Right Column - Details */}
          <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col overflow-y-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{item.title}</h2>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span>{item.year}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{item.runtime || item.developer}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-foreground font-medium">{item.rating}</span>
                <span>/ 5</span>
              </div>
            </div>

            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              {item.description}
            </p>

            {/* Interactive Rating Section */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-sm font-medium text-muted-foreground mr-2">Rate this:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    disabled={loadingAction === 'rate'}
                    className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star 
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoveredStar || userRating) 
                          ? 'text-primary fill-primary' 
                          : 'text-muted-foreground hover:text-primary/50'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 mb-10">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Available On</h4>
                <div className="flex flex-wrap gap-3">
                  {(item.type?.toLowerCase() === 'game' ? ['Steam', 'PlayStation 5', 'Xbox Series X'] : ['Netflix', 'Prime Video', 'Hulu']).map(platform => (
                    <div key={platform} className="px-4 py-2 rounded-lg bg-secondary/50 border border-border text-sm font-medium hover:bg-secondary transition-colors cursor-pointer flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/80" />
                      {platform}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleWishlist}
                  disabled={loadingAction === 'wishlist'}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  {loadingAction === 'wishlist' ? 'Loading...' : 'Add to Wishlist'}
                </button>

                <button 
                  onClick={handlePlay}
                  disabled={loadingAction === 'play'}
                  className="flex items-center justify-center w-12 h-12 bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors group disabled:opacity-50" 
                  title="Mark as viewed/played"
                >
                  <Check className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>

            {/* Additional Meta */}
            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground w-24 shrink-0">Genres</span>
                <span className="text-foreground">{item.genres.join(', ')}</span>
              </div>
              {item.director && (
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground w-24 shrink-0">Director</span>
                  <span className="text-foreground">{item.director}</span>
                </div>
              )}
              {item.cast && (
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground w-24 shrink-0">Cast</span>
                  <span className="text-foreground">{item.cast.join(', ')}</span>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
