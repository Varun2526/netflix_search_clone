import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import ContentCarousel from '../components/ContentCarousel';
import ContentDetailsModal from '../components/ContentDetailsModal';
import { getTrendingContent, getRecommendedContent, getContentByType } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Data states
  const [trendingData, setTrendingData] = useState([]);
  const [recommendedData, setRecommendedData] = useState([]);
  const [heroItems, setHeroItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch if logged in
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      // Helper to map data based on the backend Content model
      const mapData = (items) => {
        return items
          .filter(item => item.posterImage || item.posterUrl)
          .map(item => ({
            ...item,
            posterUrl: item.posterImage || item.posterUrl,
            year: item.releaseYear || item.releaseDate,
            rating: item.averageRating,
          }));
      };

      try {
        const moviesRes = await getContentByType('movie', 10, true);
        const gamesRes = await getContentByType('game', 10, true);
        
        const movies = moviesRes.data || [];
        const games = gamesRes.data || [];
        
        const combined = [];
        const maxLength = Math.max(movies.length, games.length);
        for(let i=0; i<maxLength; i++) {
          if (movies[i]) combined.push(movies[i]);
          if (games[i]) combined.push(games[i]);
        }
        
        const trendingMapped = mapData(combined.slice(0, 16));
        setTrendingData(trendingMapped);
        
        // Pick 5 random items for the hero banner
        const validForHero = trendingMapped.filter(i => i.posterImage || i.posterUrl);
        const shuffled = [...validForHero].sort(() => 0.5 - Math.random());
        setHeroItems(shuffled.slice(0, 5));
      } catch (err) {
        console.error('Trending fetch error:', err);
      }

      try {
        const recommendedRes = await getRecommendedContent(user.id);
        setRecommendedData(mapData(recommendedRes.data || []));
      } catch (err) {
        console.error('Recommendation fetch error:', err);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <>
      <main>
        <HeroBanner items={heroItems} />
        
        <div className="relative z-20 -mt-24 pb-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {trendingData.length > 0 && (
                <ContentCarousel 
                  title="Trending Now" 
                  items={trendingData} 
                  onItemClick={setSelectedItem}
                />
              )}
              {recommendedData.length > 0 && (
                <ContentCarousel 
                  title="Recommended for You" 
                  items={recommendedData} 
                  onItemClick={setSelectedItem}
                />
              )}
            </>
          )}
        </div>
      </main>

      <ContentDetailsModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </>
  );
}
