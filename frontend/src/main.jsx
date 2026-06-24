import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';

// Route-level code splitting: each page ships in its own chunk.
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Movies = lazy(() => import('./pages/Movies'));
const Games = lazy(() => import('./pages/Games'));
const Profile = lazy(() => import('./pages/Profile'));
const MyList = lazy(() => import('./pages/MyList'));
const Search = lazy(() => import('./pages/Search'));
const Discover = lazy(() => import('./pages/Discover'));
const Genre = lazy(() => import('./pages/Genre'));

const PageFallback = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

function MainLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground pb-20">
        <Navbar />
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" replace />}
          />
          <Route
            path="/movies"
            element={user ? <Movies /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/games"
            element={user ? <Games /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/wishlist"
            element={user ? <MyList /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/search"
            element={user ? <Search /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/discover"
            element={user ? <Discover /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/genre/:name"
            element={user ? <Genre /> : <Navigate to="/login" replace />}
          />
        </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  </StrictMode>
);
