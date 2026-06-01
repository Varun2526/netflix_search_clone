import React from 'react';
import { Play, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroBanner() {
  return (
    <div className="relative h-[85vh] w-full flex items-center justify-start overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://cdn1.epicgames.com/b0ebefb11a9145488af78f6d2488afff/offer/EGS_NeonAbyss_VeewoGames_S1-2560x1440-a5d38c2d5a422a1c7682082d64343e2b.jpg")',
            filter: 'brightness(0.6)'
          }}
        />
        {/* Multi-stop gradient for the true cinema feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-block px-3 py-1 rounded-full border border-primary/50 bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-6 backdrop-blur-sm uppercase">
            Featured Game
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter">
            Neon <span className="text-primary">Shadows</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
            Dive into a cyberpunk dystopia where reality blurs with digital consciousness. Uncover corporate conspiracies in a neon-soaked metropolis where every choice rewrites your destiny.
          </p>

          <div className="flex items-center gap-6 mb-10 text-sm font-medium text-foreground/80">
            <span>2026</span>
            <span className="w-1 h-1 rounded-full bg-primary/50" />
            <span>Action RPG</span>
            <span className="w-1 h-1 rounded-full bg-primary/50" />
            <span className="flex items-center gap-1">
              <span className="text-primary font-bold text-base">4.8</span>
              <span className="text-muted-foreground">/5</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-lg font-semibold transition-colors shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <Play className="w-5 h-5 fill-current" />
              Play Now
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 px-8 py-3.5 rounded-lg font-semibold transition-all backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" />
              Add to Wishlist
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
