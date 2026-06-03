import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import ContentCarousel from '../components/ContentCarousel';
import ContentDetailsModal from '../components/ContentDetailsModal';
import { getTrendingContent, getRecommendedContent } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Data states
  const [trendingData, setTrendingData] = useState([]);
  const [recommendedData, setRecommendedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch if logged in
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      // Helper to map data based on the backend Content model
      const mapData = (items) => {
        return items.map(item => ({
            ...item,
            // Use a fallback image if posterImage is empty so cards still render
            posterUrl: item.posterImage || item.posterUrl || (
              item.type === 'game' 
                ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop' 
                : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop'
            ),
            year: item.releaseYear || item.releaseDate,
            rating: item.averageRating,
          }));
      };

      try {
        const trendingRes = await getTrendingContent();
        setTrendingData(mapData(trendingRes.data || []));
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
        <HeroBanner />
        
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
