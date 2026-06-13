import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateFavoriteGenres, updateUserProfile } from '../api';
import ContentDetailsModal from '../components/ContentDetailsModal';
import { Settings, Heart, Clock, User, Mail, Image } from 'lucide-react';

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

  // Account Settings state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile(userId);
        if (res.data) {
          setProfile(res.data);
          setSelectedGenres(res.data.favoriteGenres || []);
          setEditUsername(res.data.username || '');
          setEditEmail(res.data.email || '');
          setEditAvatar(res.data.avatar || '');
          
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

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const data = {};
      if (editUsername !== profile?.username) data.username = editUsername;
      if (editEmail !== profile?.email) data.email = editEmail;
      if (editAvatar !== (profile?.avatar || '')) data.avatar = editAvatar;

      if (Object.keys(data).length === 0) {
        setProfileMsg({ type: 'info', text: 'No changes to save.' });
        setSavingProfile(false);
        return;
      }

      const res = await updateUserProfile(data);
      setProfile(res.data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
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
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-12">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold border-2 border-primary/30">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            user?.username?.[0]?.toUpperCase() || 'U'
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold">{profile?.username || user?.username}</h1>
          <p className="text-muted-foreground text-lg">{profile?.email || user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-10 bg-secondary/30 p-1 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="w-4 h-4" />
          Account Settings
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Favorite Genres */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Favorite Genres</h2>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              {AVAILABLE_GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    selectedGenres.includes(genre)
                      ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(212,175,55,0.3)]'
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

          {/* Viewing History */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Viewing History</h2>
            </div>
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
        </>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-lg">
          <h2 className="text-2xl font-bold mb-8">Account Settings</h2>

          {/* Profile Message */}
          {profileMsg && (
            <div className={`mb-6 p-4 rounded-lg border text-sm ${
              profileMsg.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : profileMsg.type === 'error'
                  ? 'bg-destructive/10 border-destructive/30 text-destructive'
                  : 'bg-primary/10 border-primary/30 text-primary'
            }`}>
              {profileMsg.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <User className="w-4 h-4" />
                Username
              </label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Image className="w-4 h-4" />
                Avatar Image URL
              </label>
              <input
                type="url"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="https://example.com/my-avatar.jpg"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/50"
              />
              {editAvatar && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 bg-card">
                    <img src={editAvatar} alt="preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                  </div>
                  <span className="text-xs text-muted-foreground">Avatar preview</span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-lg shadow-primary/20 mt-4"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
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
