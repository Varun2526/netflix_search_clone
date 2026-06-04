import React, { useState, useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import ContentDetailsModal from '../components/ContentDetailsModal';
import { getContentByType } from '../api';

export default function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      console.log('[Games] Fetching all games...');
      try {
        const res = await getContentByType('game');
        const mapped = (res.data || []).map(item => ({
          ...item,
          id: item._id,
          posterUrl: item.posterImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
          year: item.releaseYear,
          rating: item.averageRating,
        }));
        console.log('[Games] Fetched:', mapped.length, 'games');
        setGames(mapped);
      } catch (err) {
        console.error('[Games] Error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <>
      <main className="pt-28 pb-16 px-6 md:px-12 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Games</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Browse our complete collection of games
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
            <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Gamepad2 className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">No games found</p>
          </div>
        ) : (
          /* Content Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {games.map((item) => (
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
