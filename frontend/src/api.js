import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3131/api',
  withCredentials: true, // This replaces credentials: 'include'
});

export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to login');
  }
};

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
