import api from './api';
import { Enrollment, EnrollmentStatusDto, StudentLessonDetail, CourseLearningProgress, ContinueLearning } from '../types';

export const studentService = {
  enrollInCourse: async (courseId: number, options?: { paymentMethod?: string; orderId?: number }): Promise<Enrollment> => {
    const response = await api.post<Enrollment>(`/enrollments/courses/${courseId}`, options || {});
    return response.data;
  },

  getMyEnrollments: async (completedOnly?: boolean): Promise<Enrollment[]> => {
    const response = await api.get<Enrollment[]>('/enrollments/my-courses', {
      params: { completedOnly },
    });
    return response.data;
  },

  getEnrollmentStatus: async (courseId: number): Promise<EnrollmentStatusDto> => {
    const response = await api.get<EnrollmentStatusDto>(`/enrollments/courses/${courseId}/status`);
    return response.data;
  },

  getLearningLesson: async (courseId: number, lessonId: number): Promise<StudentLessonDetail> => {
    const response = await api.get<StudentLessonDetail>(`/learning/courses/${courseId}/lessons/${lessonId}`);
    return response.data;
  },

  getCourseProgress: async (courseId: number): Promise<CourseLearningProgress> => {
    const response = await api.get<CourseLearningProgress>(`/learning/courses/${courseId}/progress`);
    return response.data;
  },

  updateProgress: async (lessonId: number, watchedDurationSeconds: number, isCompleted = false): Promise<any> => {
    const response = await api.post(`/learning/lessons/${lessonId}/progress`, {
      watchedDurationSeconds,
      isCompleted,
    });
    return response.data;
  },

  completeLesson: async (lessonId: number): Promise<any> => {
    const response = await api.post(`/learning/lessons/${lessonId}/complete`);
    return response.data;
  },

  getContinueLearning: async (courseId: number): Promise<ContinueLearning> => {
    const response = await api.get<ContinueLearning>(`/learning/courses/${courseId}/continue`);
    return response.data;
  },

  getVideoStreamUrl: (lessonId: number): string => {
    return `/api/learning/lessons/${lessonId}/video-stream`;
  },

  getResourceDownloadUrl: (resourceId: number): string => {
    return `/api/learning/resources/${resourceId}/download`;
  },
};
