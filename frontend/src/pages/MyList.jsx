import React, { useState, useEffect } from 'react';
import { getWishlist } from '../api';
import ContentDetailsModal from '../components/ContentDetailsModal';

export default function MyList() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await getWishlist();
        if (res.data) {
          const mapped = res.data.map(item => ({
            ...item,
            posterUrl: item.posterImage || item.posterUrl,
            year: item.releaseYear || item.releaseDate,
            rating: item.averageRating,
          }));
          setWishlist(mapped);
        }
      } catch (err) {
        setError('Failed to fetch wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="pt-24 px-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">My List</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : wishlist.length === 0 ? (
        <div className="text-muted-foreground text-center mt-20 text-lg">Your list is empty. Explore and add some favorites!</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {wishlist.map((item) => (
            <div 
              key={item._id} 
              className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setSelectedItem(item)}
            >
              <img 
                src={item.posterUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-medium px-2 text-center">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <ContentDetailsModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
