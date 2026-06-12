import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateFavoriteGenres } from '../api';
import ContentDetailsModal from '../components/ContentDetailsModal';

const AVAILABLE_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", 
  "Documentary", "Drama", "Family", "Fantasy", "History", 
  "Horror", "Music", "Mystery", "Romance", "Science Fiction", 
  "TV Movie", "Thriller", "War", "Western", "RPG", "Shooter", "Strategy"
];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [savingGenres, setSavingGenres] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile(userId);
        if (res.data) {
          setProfile(res.data);
          setSelectedGenres(res.data.favoriteGenres || []);
          
          const mappedHistory = (res.data.recentlyViewed || []).map(item => ({
            ...item,
            posterUrl: item.posterImage || item.posterUrl,
            year: item.releaseYear || item.releaseDate,
            rating: item.averageRating,
          }));
          setHistory(mappedHistory);
        }
      } catch (err) {
        setError('Failed to fetch profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSaveGenres = async () => {
    setSavingGenres(true);
    try {
      await updateFavoriteGenres(selectedGenres);
      alert('Favorite genres updated successfully!');
    } catch (err) {
      alert('Failed to update favorite genres');
    } finally {
      setSavingGenres(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="pt-24 px-8 text-destructive text-center">{error}</div>;
  }

  return (
    <div className="pt-24 px-8 pb-12 max-w-6xl mx-auto min-h-screen">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold border border-primary/30">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-4xl font-bold">{user?.username}</h1>
          <p className="text-muted-foreground text-lg">{user?.email}</p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Favorite Genres</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {AVAILABLE_GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => handleGenreToggle(genre)}
              className={`px-4 py-2 rounded-full border transition-all ${
                selectedGenres.includes(genre)
                  ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 border-white/10 text-foreground hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        <button 
          onClick={handleSaveGenres}
          disabled={savingGenres}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          {savingGenres ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Viewing History</h2>
        {history.length === 0 ? (
          <p className="text-muted-foreground">You haven't viewed any content yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {history.map((item) => (
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
      </div>

      <ContentDetailsModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
