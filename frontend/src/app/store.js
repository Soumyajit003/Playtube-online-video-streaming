import { create } from 'zustand';
import axiosInstance from '../services/axiosInstance';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/users/login', { email, password });
      const { user, accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("REGISTRATION ERROR DETAILS:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/users/logout');
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get('/users/current-user');
      set({ user: response.data.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

export default useAuthStore;
