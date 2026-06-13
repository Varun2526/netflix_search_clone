import React, { useState, useEffect } from 'react';
import { Sparkles, Film, Star } from 'lucide-react';
import ContentCarousel from '../components/ContentCarousel';
import ContentDetailsModal from '../components/ContentDetailsModal';
import { getRecommendedContent } from '../api';
import { useAuth } from '../context/AuthContext';

// shape a raw Content doc into what ContentCard / the carousel expect
const mapItem = (item) => ({
  ...item,
  id: item._id || item.id,
  posterUrl: item.posterImage || item.posterUrl,
  year: item.releaseYear,
  rating: item.averageRating,
});

export default function Discover() {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [taste, setTaste] = useState(null);
  const [message, setMessage] = useState(null);
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

        // Prefer the new explainable `sections`; fall back to a flat `data` list.
        let secs = res.sections;
        if (!secs || secs.length === 0) {
          secs = res.data?.length
            ? [{ title: 'Recommended For You', reason: 'Picked for you', items: res.data }]
            : [];
        }

        setSections(secs.map(s => ({ ...s, items: (s.items || []).map(mapItem) })));
        setTaste(res.taste || null);
        setMessage(res.message || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const hasContent = sections.some(s => s.items.length > 0);

  return (
    <>
      <main className="pt-28 pb-16 min-h-[80vh]">
        {/* Page Header */}
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">For You</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Personalized recommendations based on your ratings, watchlist, and viewing history.
          </p>

          {/* Taste summary — surfaces the "user behavior analysis" behind the picks */}
          {taste && (taste.likedGenres?.length > 0 || taste.ratedCount > 0) && (
            <div className="mt-6 flex flex-wrap items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" /> Your taste:
              </span>
              {taste.likedGenres?.map(g => (
                <span key={g} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                  {g}
                </span>
              ))}
              {taste.ratedCount > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">{taste.ratedCount} {taste.ratedCount === 1 ? 'title' : 'titles'} rated</span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-6">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : !hasContent ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground px-6 text-center">
            <Film className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">No recommendations yet.</p>
            <p className="text-sm mt-2">{message || 'Rate a few titles or add them to your watchlist to get personalized picks!'}</p>
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto">
            {sections.filter(s => s.items.length > 0).map((section, idx) => (
              <ContentCarousel
                key={`${section.title}-${idx}`}
                title={section.title}
                subtitle={section.reason}
                items={section.items}
                onItemClick={setSelectedItem}
              />
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
