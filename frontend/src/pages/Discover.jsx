import React, { useState, useEffect } from 'react';
import { Sparkles, Film } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import ContentDetailsModal from '../components/ContentDetailsModal';
import { getRecommendedContent } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Discover() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      try {
        const res = await getRecommendedContent(user._id || user.id);
        const mapped = (res.data || []).map(item => ({
          ...item,
          id: item._id,
          posterUrl: item.posterImage || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
          year: item.releaseYear,
          rating: item.averageRating,
        }));
        setRecommendations(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [user]);

  return (
    <>
      <main className="pt-28 pb-16 px-6 md:px-12 max-w-[1600px] mx-auto min-h-[80vh]">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">For You</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Personalized recommendations based on your history, ratings, and wishlist.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Film className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">No recommendations yet.</p>
            <p className="text-sm mt-2">Start adding items to your wishlist or rating them to get personalized picks!</p>
          </div>
        ) : (
          /* Content Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {recommendations.map((item) => (
              <ContentCard key={item.id || item._id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        )}
      </main>

      <ContentDetailsModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
