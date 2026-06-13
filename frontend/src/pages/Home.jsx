import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import ContentCarousel from '../components/ContentCarousel';
import ContentDetailsModal from '../components/ContentDetailsModal';
import { getTrendingContent, getRecommendedContent, getContentByType } from '../api';
import { useAuth } from '../context/AuthContext';

// shape a raw Content doc into what the cards/carousels expect
const mapItem = (item) => ({
  ...item,
  id: item._id || item.id,
  posterUrl: item.posterImage || item.posterUrl,
  year: item.releaseYear || item.year,
  rating: item.averageRating ?? item.rating,
});

const withImages = (items) => (items || []).map(mapItem).filter((i) => i.posterUrl);

export default function Home() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [rows, setRows] = useState([]); // [{ title, subtitle, items }]
  const [heroItems, setHeroItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      const builtRows = [];

      // 1. Real trending (sorted by popularityScore on the backend)
      let trending = [];
      try {
        const res = await getTrendingContent(18);
        trending = withImages(res.data);
        if (trending.length) {
          builtRows.push({ title: 'Trending Now', subtitle: 'Most popular across movies & games', items: trending });
        }
      } catch (err) {
        console.error('Trending fetch error:', err);
      }

      // 2. Personalized recommendation sections (explainable rows)
      try {
        const res = await getRecommendedContent(user._id || user.id);
        const sections = res.sections?.length
          ? res.sections
          : (res.data?.length ? [{ title: 'Recommended For You', reason: 'Picked for you', items: res.data }] : []);
        sections.forEach((s) => {
          const items = withImages(s.items);
          if (items.length) builtRows.push({ title: s.title, subtitle: s.reason, items });
        });
      } catch (err) {
        console.error('Recommendation fetch error:', err);
      }

      // 3. Top movies and games rows
      try {
        const [moviesRes, gamesRes] = await Promise.all([
          getContentByType('movie', 18, true),
          getContentByType('game', 18, true),
        ]);
        const movies = withImages(moviesRes.data);
        const games = withImages(gamesRes.data);
        if (movies.length) builtRows.push({ title: 'Top Movies', subtitle: 'Highly rated films to explore', items: movies });
        if (games.length) builtRows.push({ title: 'Top Games', subtitle: 'Acclaimed games worth playing', items: games });

        // Hero: spotlight a few trending titles, fall back to movies
        const heroPool = (trending.length ? trending : movies).slice(0, 8);
        const shuffled = [...heroPool].sort(() => 0.5 - Math.random());
        setHeroItems(shuffled.slice(0, 5));
      } catch (err) {
        console.error('Type fetch error:', err);
      }

      setRows(builtRows);
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <>
      <main>
        <HeroBanner items={heroItems} />

        <div className="relative z-20 -mt-12 md:-mt-8 pb-12 pt-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            rows.map((row, idx) => (
              <ContentCarousel
                key={`${row.title}-${idx}`}
                title={row.title}
                subtitle={row.subtitle}
                items={row.items}
                onItemClick={setSelectedItem}
              />
            ))
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
