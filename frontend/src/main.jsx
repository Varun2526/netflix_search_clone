import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import Home from './pages/Home'
import Login from './pages/Login'
import Navbar from './components/Navbar'

function MainLayout() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground pb-20">
        <Navbar isLoggedIn={!!user} onLoginToggle={user ? handleLogout : null} />
        <Routes>
          <Route 
            path="/" 
            element={user ? <Home user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainLayout />
  </StrictMode>,
)
