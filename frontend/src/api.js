import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3131/api',
  withCredentials: true, // This replaces credentials: 'include'
});

// --- Auth APIs ---
export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to login');
  }
};

export const register = async (userData) => {
  try {
    const res = await api.post('/auth/register', userData);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to register');
  }
};

export const logout = async () => {
  try {
    const res = await api.post('/auth/logout');
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to logout');
  }
};

// --- Content APIs ---
export const getTrendingContent = async () => {
  try {
    const res = await api.get('/content/trending');
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch trending content');
  }
};

export const getRecommendedContent = async (userId) => {
  try {
    const res = await api.get(`/content/recommendation?userId=${userId}`);
    return res.data;
  } catch (err) {
    console.error('Recommendation fetch error:', err.response?.data);
    throw new Error(err.response?.data?.message || 'Failed to fetch recommendations');
  }
};

export const searchContent = async (query) => {
  try {
    const res = await api.get(`/content/search?query=${query}&limit=50&hasImage=true`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to search content');
  }
};

export const getContentByType = async (type, limit = 100, hasImage = true) => {
  try {
    const res = await api.get(`/content/search?type=${type}&limit=${limit}&hasImage=${hasImage}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || `Failed to fetch ${type}s`);
  }
};

export const getContentDetails = async (id) => {
  try {
    const res = await api.get(`/content/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch content details');
  }
};

export const getContentProviders = async (id) => {
  try {
    const res = await api.get(`/content/${id}/providers`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch providers');
  }
};

export const addToHistory = async (contentId) => {
  try {
    const res = await api.post('/content/history', { contentId });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to add to history');
  }
};

export const addToWishlist = async (contentId) => {
  try {
    const res = await api.post('/content/wishlist', { contentId });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to add to wishlist');
  }
};

export const removeFromWishlist = async (contentId) => {
  try {
    const res = await api.delete('/content/wishlist/remove', { data: { contentId } });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to remove from wishlist');
  }
};

export const rateContent = async (contentId, score) => {
  try {
    const res = await api.post('/content/rate', { contentId, score });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to rate content');
  }
};

// --- User Profile APIs ---
export const getUserProfile = async (id) => {
  try {
    const res = await api.get(`/user/profile/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch user profile');
  }
};

export const updateFavoriteGenres = async (genres) => {
  try {
    const res = await api.put('/user/favorite-genres', { genres });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to update favorite genres');
  }
};

export const getWishlist = async () => {
  try {
    const res = await api.get('/user/wishlist');
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch wishlist');
  }
};

export const getHistory = async () => {
  try {
    const res = await api.get('/user/history');
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch history');
  }
};
