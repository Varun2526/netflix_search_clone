import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentCard from './ContentCard';

export default function ContentCarousel({ title, subtitle, items, onItemClick }) {
  const rowRef = useRef(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction) => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;
        
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-12 last:mb-0">
      <div className="mb-6 px-6 md:px-12">
        <h2 className="text-2xl font-bold text-foreground/90 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      <div className="group/carousel relative">
        {/* Left Arrow */}
        <div 
          className={`absolute top-0 bottom-0 left-0 z-40 w-12 md:w-16 bg-gradient-to-r from-background to-transparent flex items-center justify-start px-2 md:px-4 cursor-pointer transition-opacity duration-300 opacity-0 group-hover/carousel:opacity-100 ${!isMoved && 'hidden'}`}
          onClick={() => handleClick('left')}
        >
          <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-black/80 hover:border-primary/50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Carousel Content */}
        <div 
          ref={rowRef}
          className="flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-hide px-6 md:px-12 scroll-smooth py-4"
        >
          {items.map((item) => (
            <div key={item.id} className="flex-none w-[150px] sm:w-[180px] md:w-[220px]">
              <ContentCard item={item} onClick={onItemClick} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <div 
          className="absolute top-0 bottom-0 right-0 z-40 w-12 md:w-16 bg-gradient-to-l from-background to-transparent flex items-center justify-end px-2 md:px-4 cursor-pointer transition-opacity duration-300 opacity-0 group-hover/carousel:opacity-100"
          onClick={() => handleClick('right')}
        >
          <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-black/80 hover:border-primary/50 transition-colors">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
