import api from './api';
import { Review } from '../types';

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating: number;
  comment?: string;
}

export const reviewService = {
  getCourseReviews: async (courseId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/courses/${courseId}/reviews`);
    return response.data;
  },

  getMyReview: async (courseId: number): Promise<Review | null> => {
    try {
      const response = await api.get<Review>(`/courses/${courseId}/reviews/my-review`);
      return response.data;
    } catch {
      return null;
    }
  },

  addReview: async (courseId: number, dto: CreateReviewDto): Promise<Review> => {
    const response = await api.post<Review>(`/courses/${courseId}/reviews`, dto);
    return response.data;
  },

  updateReview: async (reviewId: number, dto: UpdateReviewDto): Promise<Review> => {
    const response = await api.put<Review>(`/reviews/${reviewId}`, dto);
    return response.data;
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },
};
