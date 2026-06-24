import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Check, Plus, Star, Eye } from 'lucide-react';
import { addToHistory, addToWishlist, rateContent, getContentProviders, getSimilarContent } from '../api';

// normalize a raw Content doc from the API into the shape this modal renders
const mapItem = (raw) => raw && ({
  ...raw,
  _id: raw._id || raw.id,
  posterUrl: raw.posterImage || raw.posterUrl,
  year: raw.releaseYear || raw.year,
  rating: raw.averageRating ?? raw.rating,
});

export default function ContentDetailsModal({ item, isOpen, onClose }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text }
  // internal "active" item so clicking a "More Like This" card swaps the modal content
  const [active, setActive] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  // sync internal active item whenever the parent opens a new item
  React.useEffect(() => {
    if (isOpen && item) setActive(mapItem(item));
  }, [isOpen, item]);

  // fetch providers + similar titles whenever the active item changes
  React.useEffect(() => {
    if (!isOpen || !active?._id) {
      setProviders([]);
      setSimilar([]);
      return;
    }
    setUserRating(0);

    (async () => {
      setLoadingProviders(true);
      try {
        const res = await getContentProviders(active._id);
        setProviders(res?.data || []);
      } catch {
        setProviders([]);
      } finally {
        setLoadingProviders(false);
      }
    })();

    (async () => {
      setLoadingSimilar(true);
      try {
        const res = await getSimilarContent(active._id);
        setSimilar((res?.data || []).map(mapItem));
      } catch {
        setSimilar([]);
      } finally {
        setLoadingSimilar(false);
      }
    })();
  }, [isOpen, active?._id]);

  // Escape-to-close + lock background scroll while the modal is open
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !active) return null;

  const handleMarkWatched = async () => {
    setLoadingAction('watched');
    try {
      await addToHistory(active._id);
      showToast('success', active.type === 'game' ? 'Marked as played' : 'Marked as watched');
    } catch {
      showToast('error', 'Could not update your history');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleWishlist = async () => {
    setLoadingAction('wishlist');
    try {
      await addToWishlist(active._id);
      showToast('success', 'Saved to your watchlist');
    } catch {
      showToast('error', 'Could not save to watchlist');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRate = async (score) => {
    setLoadingAction('rate');
    try {
      await rateContent(active._id, score);
      setUserRating(score);
      showToast('success', 'Thanks — this improves your recommendations');
    } catch {
      showToast('error', 'Could not submit your rating');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" onClick={onClose} />

        {/* Modal Body */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/50 z-10 flex flex-col md:flex-row max-h-[88vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-black/80 hover:border-white/30 transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium border backdrop-blur-md ${
                  toast.type === 'success'
                    ? 'bg-green-500/15 border-green-500/30 text-green-300'
                    : 'bg-destructive/15 border-destructive/30 text-destructive'
                }`}
              >
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Column - Poster */}
          <div className="w-full md:w-[40%] h-64 md:h-auto relative shrink-0">
            <img src={active.posterUrl} alt={active.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent md:bg-gradient-to-r md:from-transparent md:to-card" />
          </div>

          {/* Right Column - Details */}
          <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col overflow-y-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{active.title}</h2>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span>{active.year}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{active.runtime || active.developer}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-foreground font-medium">{active.rating ? (active.rating / 2).toFixed(1) : 0}</span>
                <span>/ 5</span>
              </div>
            </div>

            <p className="text-base text-foreground/80 mb-6 leading-relaxed">{active.description}</p>

            {/* Interactive Rating Section */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm font-medium text-muted-foreground mr-2">Rate this to tune your picks:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    disabled={loadingAction === 'rate'}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoveredStar || userRating)
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground hover:text-primary/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Where to watch / actions */}
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Where to watch{active.type === 'game' ? ' / buy' : ''}</h4>
                <div className="flex flex-wrap gap-3">
                  {loadingProviders ? (
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  ) : providers.length > 0 ? (
                    providers.map(platform => (
                      <div key={platform.name} className="px-4 py-2 rounded-lg bg-secondary/50 border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                        {platform.logoPath ? (
                          <img src={platform.logoPath} alt={platform.name} className="w-5 h-5 rounded-sm object-cover" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-primary/80" />
                        )}
                        {platform.name}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No streaming/store availability found.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleWishlist}
                  disabled={loadingAction === 'wishlist'}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  {loadingAction === 'wishlist' ? 'Saving...' : 'Add to Watchlist'}
                </button>

                <button
                  onClick={handleMarkWatched}
                  disabled={loadingAction === 'watched'}
                  className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg px-4 py-3 transition-colors group disabled:opacity-50 text-sm font-medium text-muted-foreground hover:text-foreground"
                  title="Tell us you've already seen this"
                >
                  <Eye className="w-5 h-5" />
                  {active.type === 'game' ? 'Played' : 'Watched'}
                </button>
              </div>
            </div>

            {/* Additional Meta */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground w-24 shrink-0">Genres</span>
                <div className="flex flex-wrap gap-2">
                  {(active.genres || []).map((genre, i) => (
                    <Link
                      key={i}
                      to={`/genre/${encodeURIComponent(genre)}`}
                      onClick={onClose}
                      className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
              {active.director && (
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground w-24 shrink-0">Director</span>
                  <span className="text-foreground">{active.director}</span>
                </div>
              )}
              {active.cast && active.cast.length > 0 && (
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground w-24 shrink-0">Cast</span>
                  <span className="text-foreground">{active.cast.join(', ')}</span>
                </div>
              )}
            </div>

            {/* More Like This — content-based recommendations */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-lg font-bold mb-4">More Like This</h4>
              {loadingSimilar ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  Finding similar titles…
                </div>
              ) : similar.length === 0 ? (
                <p className="text-sm text-muted-foreground">No similar titles found.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {similar.slice(0, 8).map((sim) => (
                    <button
                      key={sim._id}
                      onClick={() => setActive(sim)}
                      className="text-left group"
                      title={sim.similarityReason}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary border border-border">
                        <img src={sim.posterUrl} alt={sim.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <p className="mt-1.5 text-xs font-medium line-clamp-1 text-foreground/90">{sim.title}</p>
                      {sim.similarityReason && (
                        <p className="text-[10px] text-primary/80 line-clamp-1">{sim.similarityReason}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
