import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info, Star } from 'lucide-react';

export default function ContentCard({ item, onClick }) {
  const ratingOutOf5 = item.rating ? (item.rating / 2).toFixed(1) : null;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${item.title}`}
      className="relative w-full aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
      whileHover={{ scale: 1.04, zIndex: 30 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
    >
      {/* Poster */}
      <img
        src={item.posterUrl}
        alt={item.title}
        loading="lazy"
        width="300"
        height="450"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Type badge (top-right) */}
      <div className="absolute top-2 right-2 z-20">
        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider uppercase text-white/90">
          {item.type}
        </span>
      </div>

      {/* Rating pill (top-left) */}
      {ratingOutOf5 && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span className="text-[11px] font-semibold text-white">{ratingOutOf5}</span>
        </div>
      )}

      {/* Permanent bottom gradient + title (visible without hover, fades on hover) */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/70 to-transparent p-3 pt-10 transition-opacity duration-300 group-hover:opacity-0">
        <h3 className="font-bold text-sm md:text-base line-clamp-2 drop-shadow-md text-foreground">{item.title}</h3>
      </div>

      {/* Rich hover panel */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-3 md:p-4 bg-gradient-to-t from-background via-background/85 to-background/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="font-bold text-sm md:text-lg line-clamp-2 mb-1 text-foreground">{item.title}</h3>

        <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground mb-2">
          {item.year && <span>{item.year}</span>}
          {item.year && ratingOutOf5 && <span className="w-1 h-1 rounded-full bg-white/30" />}
          {ratingOutOf5 && (
            <span className="flex items-center gap-1 text-foreground">
              <Star className="w-3 h-3 text-primary fill-primary" />
              {ratingOutOf5}
            </span>
          )}
        </div>

        {item.description && (
          <p className="hidden md:block text-[11px] leading-snug text-foreground/70 line-clamp-3 mb-3">
            {item.description}
          </p>
        )}

        {/* Genre chips */}
        {item.genres?.length > 0 && (
          <div className="hidden md:flex flex-wrap gap-1 mb-3">
            {item.genres.slice(0, 3).map((genre, i) => (
              <Link
                key={i}
                to={`/genre/${encodeURIComponent(genre)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-sm bg-white/10 border border-white/5 backdrop-blur-sm hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-colors"
              >
                {genre}
              </Link>
            ))}
          </div>
        )}

        {/* Details cue */}
        <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs md:text-sm font-semibold">
          <Info className="w-4 h-4" />
          View Details
        </div>
      </div>
    </motion.div>
  );
}
