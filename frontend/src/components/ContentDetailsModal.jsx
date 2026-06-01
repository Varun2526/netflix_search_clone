import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, Check, Star } from 'lucide-react';

export default function ContentDetailsModal({ item, isOpen, onClose }) {
  if (!isOpen || !item) return null;

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
          className="relative w-full max-w-5xl bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row h-[80vh] md:h-[600px]"
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

            <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-center gap-4 mb-10">
              <button className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Play className="w-5 h-5 fill-current" />
                Play Now
              </button>
              
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 py-3 rounded-lg font-semibold transition-colors">
                <Plus className="w-5 h-5" />
                Add to Wishlist
              </button>

              <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group" title="Mark as played">
                <Check className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
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
