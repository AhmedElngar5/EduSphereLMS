import api from './api';
import { CourseSummary, CourseDetail, Category, PaginatedResult } from '../types';

export interface CourseFilterParams {
  search?: string;
  categoryId?: number;
  level?: string;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const courseService = {
  getCourses: async (params?: CourseFilterParams): Promise<PaginatedResult<CourseSummary>> => {
    const response = await api.get<PaginatedResult<CourseSummary>>('/courses', { params });
    return response.data;
  },

  getCourseById: async (id: number): Promise<CourseDetail> => {
    const response = await api.get<CourseDetail>(`/courses/${id}`);
    return response.data;
  },

  getCourseBySlug: async (slug: string): Promise<CourseDetail> => {
    const response = await api.get<CourseDetail>(`/courses/slug/${encodeURIComponent(slug)}`);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/courses/categories');
    return response.data;
  },

  getFeaturedCourses: async (): Promise<CourseSummary[]> => {
    const response = await api.get<CourseSummary[]>('/courses/featured');
    return response.data;
  },

  getTopRatedCourses: async (): Promise<CourseSummary[]> => {
    const response = await api.get<CourseSummary[]>('/courses/top-rated');
    return response.data;
  },

  getInstructorCourses: async (instructorId: string): Promise<CourseSummary[]> => {
    const response = await api.get<CourseSummary[]>(`/courses/instructor/${instructorId}`);
    return response.data;
  },
};

