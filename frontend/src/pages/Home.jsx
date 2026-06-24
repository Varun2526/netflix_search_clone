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

      // PHASE 1 — fast content (trending + top lists). Render immediately so the
      // page isn't blocked on the slower personalized recommendation query.
      const [trendMoviesRes, trendGamesRes, moviesRes, gamesRes] = await Promise.all([
        getTrendingContent(8, 'movie').catch(() => ({ data: [] })),
        getTrendingContent(8, 'game').catch(() => ({ data: [] })),
        getContentByType('movie', 24, true).catch(() => ({ data: [] })),
        getContentByType('game', 24, true).catch(() => ({ data: [] })),
      ]);

      // Trending Now — balanced mix of top movies + top games
      const trending = fresh(interleave(withImages(trendMoviesRes.data), withImages(trendGamesRes.data)));
      const baseRows = [];
      if (trending.length) {
        baseRows.push({ title: 'Trending Now', subtitle: 'Most popular across movies & games', items: trending });
      }

      // Top Movies / Top Games
      const topMovies = fresh(withImages(moviesRes.data));
      const topRows = [];
      if (topMovies.length >= 3) topRows.push({ title: 'Top Movies', subtitle: 'Highly rated films to explore', items: topMovies });
      const topGames = fresh(withImages(gamesRes.data));
      if (topGames.length >= 3) topRows.push({ title: 'Top Games', subtitle: 'Acclaimed games worth playing', items: topGames });

      // Hero spotlight — a MIX of movies and games (trending is already
      // interleaved). Games render vivid Steam art; movies use their poster.
      const heroPool = (trending.length ? trending : topMovies).slice(0, 10);
      setHeroItems([...heroPool].sort(() => 0.5 - Math.random()).slice(0, 5));

      setRows([...baseRows, ...topRows]);
      setIsLoading(false);

      // PHASE 2 — personalized recommendations (slower). Insert after Trending
      // when they arrive, deduped against everything already shown.
      try {
        const recRes = await getRecommendedContent(user._id || user.id);
        const recSections = recRes.sections?.length
          ? recRes.sections
          : (recRes.data?.length ? [{ title: 'Recommended For You', reason: 'Picked for you', items: recRes.data }] : []);
        const recRows = [];
        recSections.forEach((s) => {
          const items = fresh(withImages(s.items));
          if (items.length >= 3) recRows.push({ title: s.title, subtitle: s.reason, items });
        });
        if (recRows.length) {
          setRows((prev) => {
            const copy = [...prev];
            copy.splice(baseRows.length, 0, ...recRows); // right after Trending
            return copy;
          });
        }
      } catch {
        // recommendations are best-effort; the page already rendered without them
      }
    };

    fetchData();
  }, [user]);

  return (
    <>
      <main>
        <HeroBanner items={heroItems} onSelect={setSelectedItem} />

        <div className="relative z-20 -mt-12 md:-mt-8 pb-12 pt-8">
          {isLoading ? (
            <div className="space-y-8">
              {[0, 1].map((r) => (
                <div key={r}>
                  <div className="h-7 w-48 rounded-md bg-card animate-pulse mb-6 mx-6 md:mx-12" />
                  <div className="flex gap-4 md:gap-6 px-6 md:px-12 overflow-hidden">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex-none w-[150px] sm:w-[180px] md:w-[220px] aspect-[2/3] rounded-xl bg-card animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
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
