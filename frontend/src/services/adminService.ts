import api from './api';
import { CourseSummary, CourseDetail, Category, User, PaginatedResult } from '../types';

export interface AdminUserItem extends User {
  isActive: boolean;
  createdAtUtc: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  monthlyEnrollments: Array<{
    month: string;
    label: string;
    count: number;
  }>;
  topCourses: Array<{
    courseId: number;
    title: string;
    instructorName: string;
    categoryName: string;
    enrolledCount: number;
    averageRating: number;
    totalReviews: number;
    status: number;
    price: number;
    isFree: boolean;
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    isActive: boolean;
    createdAtUtc: string;
  }>;
  recentTransactions: Array<{
    paymentId: number;
    orderId: number;
    courseTitle: string;
    studentName: string;
    amount: number;
    currency: string;
    paidAtUtc: string;
    gateway: string;
  }>;
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardData> => {
    const response = await api.get<AdminDashboardData>('/admin/dashboard');
    return response.data;
  },
  getPendingCourses: async (pageNumber = 1, pageSize = 20): Promise<PaginatedResult<CourseSummary>> => {
    const response = await api.get<PaginatedResult<CourseSummary>>('/admin/courses/pending', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  },

  getAllCourses: async (status?: number, pageNumber = 1, pageSize = 20): Promise<PaginatedResult<CourseSummary>> => {
    const response = await api.get<PaginatedResult<CourseSummary>>('/admin/courses', {
      params: { status, pageNumber, pageSize },
    });
    return response.data;
  },

  getCourseDetail: async (courseId: number): Promise<CourseDetail> => {
    const response = await api.get<CourseDetail>(`/admin/courses/${courseId}`);
    return response.data;
  },

  approveCourse: async (courseId: number): Promise<CourseSummary> => {
    const response = await api.post<CourseSummary>(`/admin/courses/${courseId}/approve`);
    return response.data;
  },

  rejectCourse: async (courseId: number, reason: string): Promise<CourseSummary> => {
    const response = await api.post<CourseSummary>(`/admin/courses/${courseId}/reject`, { reason });
    return response.data;
  },

  publishCourse: async (courseId: number): Promise<CourseSummary> => {
    const response = await api.post<CourseSummary>(`/admin/courses/${courseId}/publish`);
    return response.data;
  },

  unpublishCourse: async (courseId: number): Promise<CourseSummary> => {
    const response = await api.post<CourseSummary>(`/admin/courses/${courseId}/unpublish`);
    return response.data;
  },

  deleteCourse: async (courseId: number): Promise<void> => {
    await api.delete(`/admin/courses/${courseId}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  createCategory: async (data: { name: string; slug: string; description?: string; displayOrder: number }): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  getAllUsers: async (): Promise<AdminUserItem[]> => {
    const response = await api.get<AdminUserItem[]>('/admin/users');
    return response.data;
  },

  toggleUserStatus: async (userId: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await api.put<{ id: string; isActive: boolean }>(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },
};
