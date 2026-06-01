import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';

export default function ContentCard({ item, onClick }) {
  const isMovie = item.type === 'movie';

  return (
    <motion.div
      className="relative flex-none w-[200px] md:w-[240px] aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-card border border-white/5"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => onClick(item)}
    >
      {/* Poster Image */}
      <img 
        src={item.posterUrl} 
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Type Badge */}
      <div className="absolute top-3 right-3 z-20">
        <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider uppercase text-white/90">
          {item.type}
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        
        {/* Play Button - Centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.6)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75"
          >
            <Play className="w-5 h-5 text-primary-foreground fill-current ml-1" />
          </motion.div>
        </div>

        {/* Metadata - Bottom */}
        <div className="relative z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>{item.year}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="text-foreground">{item.rating}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {item.genres.slice(0, 2).map((genre, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/10 border border-white/5">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Neon Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 pointer-events-none z-30" />
    </motion.div>
  );
}
