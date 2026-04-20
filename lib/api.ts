import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const rt = localStorage.getItem('refreshToken');
        if (!rt) throw new Error();
        const { data } = await axios.post(`${BASE}/auth/refresh-token`, { refreshToken: rt });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        orig.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(orig);
      } catch {
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
