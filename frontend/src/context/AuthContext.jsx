import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      console.log('[AuthContext] Checking existing session...');
      try {
        const res = await api.get('/auth/me');
        console.log('[AuthContext] /me response:', res.data);
        if (res.data.success) {
          setUser(res.data.payload);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.log('[AuthContext] No active session:', err.response?.status);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    console.log('[AuthContext] Logging in with:', email);
    try {
      const res = await api.post('/auth/login', { email, password });
      console.log('[AuthContext] Login success:', res.data);
      setUser(res.data.payload);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error('[AuthContext] Login failed:', err.response?.status, errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (username, email, password) => {
    console.log('[AuthContext] Registering user:', { username, email });
    try {
      const res = await api.post('/auth/register', { username, email, password });
      console.log('[AuthContext] Register success:', res.data);
      setUser(res.data.payload);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      console.error('[AuthContext] Register failed:', err.response?.status, errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Logging out...');
    try {
      await api.post('/auth/logout', {});
      console.log('[AuthContext] Logout success');
      setUser(null);
    } catch (err) {
      console.error('[AuthContext] Logout failed:', err.response?.status, err.message);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
