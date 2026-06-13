import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tag } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import ContentDetailsModal from '../components/ContentDetailsModal';
import { searchByGenre } from '../api';

const ITEMS_PER_PAGE = 25;

export default function Genre() {
  const { name } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const mapItems = (data) =>
    (data || []).map(item => ({
      ...item,
      id: item._id,
      posterUrl: item.posterImage || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
      year: item.releaseYear,
      rating: item.averageRating,
    }));

  useEffect(() => {
    const fetchGenreContent = async () => {
      setLoading(true);
      setError(null);
      setItems([]);
      setPage(1);
      try {
        const res = await searchByGenre(name, 1, ITEMS_PER_PAGE);
        setItems(mapItems(res.data));
        setHasMore(res.data.length >= ITEMS_PER_PAGE);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGenreContent();
  }, [name]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await searchByGenre(name, nextPage, ITEMS_PER_PAGE);
      const newItems = mapItems(res.data);
      setItems(prev => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(newItems.length >= ITEMS_PER_PAGE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <main className="pt-28 pb-16 px-6 md:px-12 max-w-[1600px] mx-auto min-h-[80vh]">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Browse all movies and games in the <span className="text-primary font-medium">{name}</span> genre.
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
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Tag className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">No content found for "{name}"</p>
          </div>
        ) : (
          <>
            {/* Content Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {items.map((item) => (
                <ContentCard key={item.id || item._id} item={item} onClick={setSelectedItem} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : 'Load More'}
                </button>
              </div>
            )}
          </>
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
