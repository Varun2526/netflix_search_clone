const API_BASE_URL = 'http://localhost:3131/api';

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to login');
  }
  return res.json();
};

export const getTrendingContent = async () => {
  const res = await fetch(`${API_BASE_URL}/content/trending`);
  if (!res.ok) throw new Error('Failed to fetch trending content');
  return res.json();
};

export const getRecommendedContent = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/content/recommendation?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
};
