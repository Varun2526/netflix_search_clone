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

      // page-wide dedup: a title shown in one row is never repeated below it
      const used = new Set();
      const fresh = (items) => {
        const out = [];
        for (const it of items) {
          if (it.id && !used.has(it.id)) { out.push(it); used.add(it.id); }
        }
        return out;
      };
      // interleave two lists so a mixed row alternates types
      const interleave = (a, b) => {
        const out = [];
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
          if (a[i]) out.push(a[i]);
          if (b[i]) out.push(b[i]);
        }
        return out;
      };

      // fetch everything up front, then build rows with dedup applied in order
      const [trendMoviesRes, trendGamesRes, recRes, moviesRes, gamesRes] = await Promise.all([
        getTrendingContent(8, 'movie').catch(() => ({ data: [] })),
        getTrendingContent(8, 'game').catch(() => ({ data: [] })),
        getRecommendedContent(user._id || user.id).catch(() => ({ data: [], sections: [] })),
        getContentByType('movie', 24, true).catch(() => ({ data: [] })),
        getContentByType('game', 24, true).catch(() => ({ data: [] })),
      ]);

      const builtRows = [];

      // 1. Trending Now — balanced mix of top movies + top games
      const trending = fresh(interleave(withImages(trendMoviesRes.data), withImages(trendGamesRes.data)));
      if (trending.length) {
        builtRows.push({ title: 'Trending Now', subtitle: 'Most popular across movies & games', items: trending });
      }

      // 2. Personalized recommendation sections (already deduped server-side)
      const recSections = recRes.sections?.length
        ? recRes.sections
        : (recRes.data?.length ? [{ title: 'Recommended For You', reason: 'Picked for you', items: recRes.data }] : []);
      recSections.forEach((s) => {
        const items = fresh(withImages(s.items));
        if (items.length >= 3) builtRows.push({ title: s.title, subtitle: s.reason, items });
      });

      // 3. Top Movies / Top Games — deep cuts, excluding anything shown above
      const topMovies = fresh(withImages(moviesRes.data));
      if (topMovies.length >= 3) builtRows.push({ title: 'Top Movies', subtitle: 'Highly rated films to explore', items: topMovies });
      const topGames = fresh(withImages(gamesRes.data));
      if (topGames.length >= 3) builtRows.push({ title: 'Top Games', subtitle: 'Acclaimed games worth playing', items: topGames });

      // Hero spotlight: prefer items with a landscape bannerImage so the hero
      // isn't a cropped portrait poster; fall back to trending, then movies.
      const bannered = trending.filter((i) => i.bannerImage);
      const heroPool = (bannered.length >= 3 ? bannered : (trending.length ? trending : topMovies)).slice(0, 8);
      setHeroItems([...heroPool].sort(() => 0.5 - Math.random()).slice(0, 5));

      setRows(builtRows);
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <>
      <main>
        <HeroBanner items={heroItems} onSelect={setSelectedItem} />

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
