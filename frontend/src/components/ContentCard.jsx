import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';

export default function ContentCard({ item, onClick }) {
  const isMovie = item.type === 'movie';

  return (
    <motion.div
      className="relative flex-none w-[160px] md:w-[240px] aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-card border border-border flex flex-col"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => onClick(item)}
    >
      {/* Poster Image */}
      <div className="w-full h-full absolute inset-0">
        <img 
          src={item.posterUrl} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Type Badge */}
      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20">
        <div className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider uppercase text-white/90">
          {item.type}
        </div>
      </div>

      {/* Permanent Bottom Gradient & Metadata */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/80 to-transparent p-3 md:p-4 pt-12 flex flex-col justify-end">
        <h3 className="font-bold text-sm md:text-lg mb-1 line-clamp-1 drop-shadow-md text-foreground">{item.title}</h3>
        
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 drop-shadow-md">
          <span>{item.year}</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-foreground">{item.rating ? (item.rating / 2).toFixed(1) : 0}</span>
          </div>
        </div>

        <div className="hidden md:flex gap-1 md:gap-2">
          {item.genres?.slice(0, 2).map((genre, i) => (
            <Link
              key={i}
              to={`/genre/${encodeURIComponent(genre)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-sm bg-white/10 border border-white/5 backdrop-blur-sm hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-colors"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>

      {/* Play Icon on Hover */}
      <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
        >
          <Play className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground fill-current ml-1" />
        </motion.div>
      </div>
    </motion.div>
  );
}
