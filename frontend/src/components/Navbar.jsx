import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Debounce search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, navigate]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-background/95 backdrop-blur-xl border-b border-border py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex items-center justify-between gap-8">
          
          <div className="flex items-center gap-4 md:gap-12">
            {/* Mobile Menu Toggle */}
            {user && (
              <button 
                className="lg:hidden text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="text-2xl md:text-3xl font-bold text-foreground tracking-tighter flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xl">K</span>
              KAIRO
            </Link>

            {/* Desktop Nav */}
            {user && (
              <div className="hidden lg:flex items-center gap-6">
                <Link to="/" className="text-foreground hover:text-primary transition-colors text-sm font-medium">Home</Link>
                <Link to="/discover" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">For You</Link>
                <Link to="/movies" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Movies</Link>
                <Link to="/games" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Games</Link>
                <Link to="/wishlist" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">My Watchlist</Link>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 md:gap-6">
            {user && (
              <>
                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search movies, games, or genres..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    className="bg-secondary/50 border border-border text-sm rounded-full pl-10 pr-4 py-2 w-[280px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
                  />
                </div>

                {/* Notification Icon */}
                <button className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                  <Bell className="w-5 h-5" />
                </button>
              </>
            )}

            <button
              onClick={() => user ? navigate('/profile') : navigate('/login')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                user
                  ? 'bg-primary/20 border border-primary/30 hover:bg-primary/40'
                  : 'bg-secondary border border-border hover:bg-secondary/80'
              }`}
              title={user ? 'Profile' : 'Log in'}
            >
              <User className={`w-5 h-5 ${user ? 'text-primary' : 'text-foreground'}`} />
            </button>
            
            {user && (
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive transition-colors text-sm font-medium hidden sm:block"
                title="Log out"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && user && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 lg:hidden">
          <div className="flex flex-col gap-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search movies, games..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-secondary/50 border border-border text-base rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex flex-col gap-4 text-lg font-medium">
              <Link to="/" className="text-foreground hover:text-primary transition-colors py-2 border-b border-border">Home</Link>
              <Link to="/discover" className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border">For You</Link>
              <Link to="/movies" className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border">Movies</Link>
              <Link to="/games" className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border">Games</Link>
              <Link to="/wishlist" className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border">My Watchlist</Link>
              <button onClick={handleLogout} className="text-destructive text-left py-2 border-b border-border">Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
