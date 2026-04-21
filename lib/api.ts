import axios from 'axios';

// আপনার ব্যাকএন্ড অনুযায়ী BASE URL এ /api থাকা বাধ্যতামূলক
const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://online-course-platform-backend-quvg.onrender.com/api';

const api = axios.create({ 
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: প্রতিটি রিকোয়েস্টে টোকেন যোগ করবে
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: 401 এরর হ্যান্ডেল এবং টোকেন রিফ্রেশ করবে
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    
    // যদি এরর 401 হয় এবং এটি আগে রিট্রাই করা না হয়ে থাকে
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        // আপনার ব্যাকএন্ড রাউট অনুযায়ী: /api/auth/refresh-token
        // আমরা সরাসরি axios ব্যবহার করছি যেন baseURL এর সাথে কনফ্লিক্ট না হয়
        const response = await axios.post(`${BASE}/auth/refresh-token`, { 
          refreshToken 
        });

        // আপনার ব্যাকএন্ড রেসপন্স স্ট্রাকচার অনুযায়ী ডেটা নেওয়া
        // সাধারণত response.data.data এর ভেতর টোকেন থাকে
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // নতুন টোকেন দিয়ে অরিজিনাল রিকোয়েস্টটি পুনরায় পাঠানো
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // যদি রিফ্রেশ টোকেনও ফেইল করে, তবে লগআউট করিয়ে দিন
        console.error("Session expired. Logging out...");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;