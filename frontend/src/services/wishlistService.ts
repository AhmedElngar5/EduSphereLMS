import api from './api';
import { WishlistItem } from '../types';

export const wishlistService = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const response = await api.get<WishlistItem[]>('/wishlist');
    return response.data;
  },

  addToWishlist: async (courseId: number): Promise<WishlistItem> => {
    const response = await api.post<WishlistItem>(`/wishlist/courses/${courseId}`);
    return response.data;
  },

  removeFromWishlist: async (courseId: number): Promise<void> => {
    await api.delete(`/wishlist/courses/${courseId}`);
  },

  checkWishlist: async (courseId: number): Promise<{ inWishlist: boolean }> => {
    const response = await api.get<{ inWishlist: boolean }>(`/wishlist/courses/${courseId}/status`);
    return response.data;
  },
};
