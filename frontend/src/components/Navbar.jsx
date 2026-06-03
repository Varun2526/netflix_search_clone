import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent tracking-tighter">
            KAIRO
          </h1>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
                Home
              </Link>
              <Link to="/movies" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                Movies
              </Link>
              <Link to="/games" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                Games
              </Link>
              <Link to="/wishlist" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                My Wishlist
              </Link>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {user && (
            <>
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search movies, games, or genres..."
                  className="bg-white/5 border border-white/10 text-sm rounded-full pl-10 pr-4 py-2 w-[280px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
                />
              </div>

              {/* Notification Icon */}
              <button className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                <Bell className="w-5 h-5" />
              </button>
            </>
          )}

          <button
    onClick={user ? handleLogout : () => navigate('/login')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              user
                ? 'bg-primary/20 border border-primary/50 hover:bg-primary/40'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
            title={user ? 'Log out' : 'Log in'}
          >
            <User className={`w-5 h-5 ${user ? 'text-primary' : 'text-foreground'}`} />
          </button>
        </div>
      </div>
    </nav>
  );
}
