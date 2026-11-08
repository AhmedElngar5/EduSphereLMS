import api from './api';
import { CourseSummary, CourseDetail, Section, Lesson, CourseResource } from '../types';

export interface CreateCourseDto {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  categoryId: number;
  level: string;
  language?: string;
  price: number;
  discountPrice?: number;
  isFree?: boolean;
  requirements?: string;
  whatYouWillLearn?: string;
  whoIsThisFor?: string;
}

export interface UpdateCourseDto extends CreateCourseDto {}

export interface CreateSectionDto {
  title: string;
  description?: string;
  displayOrder: number;
}

export interface CreateLessonDto {
  title: string;
  description?: string;
  type: string;
  displayOrder: number;
  isPreviewFree: boolean;
  durationSeconds?: number;
}

export interface InstructorStudentDto {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  enrolledAtUtc: string;
  progressPercentage: number;
  status: string;
}

export interface InstructorDashboardData {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  instructorEarnings: number;
  totalSalesCount: number;
  averageRating: number;
  courseBreakdown: Array<{
    courseId: number;
    title: string;
    status: number;
    enrolledCount: number;
    averageRating: number;
    totalReviews: number;
    salesCount: number;
    totalRevenue: number;
    instructorEarnings: number;
    thumbnailUrl?: string;
    categoryName: string;
    isFree: boolean;
    price: number;
  }>;
  monthlyEnrollments: Array<{
    month: string;
    label: string;
    count: number;
  }>;
  recentEnrollments: Array<{
    enrollmentId: number;
    courseId: number;
    courseTitle: string;
    studentName: string;
    enrolledAtUtc: string;
    progressPercentage: number;
    status: number;
  }>;
}

export const instructorService = {
  getDashboardStats: async (): Promise<InstructorDashboardData> => {
    const response = await api.get<InstructorDashboardData>('/instructor/dashboard');
    return response.data;
  },
  getMyCourses: async (): Promise<CourseSummary[]> => {
    const response = await api.get<CourseSummary[]>('/instructor/courses');
    return response.data;
  },

  getCourse: async (id: number): Promise<CourseDetail> => {
    const response = await api.get<CourseDetail>(`/instructor/courses/${id}`);
    return response.data;
  },

  createCourse: async (dto: CreateCourseDto): Promise<CourseSummary> => {
    const response = await api.post<CourseSummary>('/instructor/courses', dto);
    return response.data;
  },

  updateCourse: async (id: number, dto: UpdateCourseDto): Promise<CourseSummary> => {
    const response = await api.put<CourseSummary>(`/instructor/courses/${id}`, dto);
    return response.data;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/instructor/courses/${id}`);
  },

  uploadThumbnail: async (courseId: number, file: File): Promise<{ thumbnailUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ thumbnailUrl: string }>(
      `/instructor/courses/${courseId}/thumbnail`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  submitForApproval: async (courseId: number): Promise<any> => {
    const response = await api.post(`/instructor/courses/${courseId}/submit-approval`);
    return response.data;
  },

  getApprovalStatus: async (courseId: number): Promise<any> => {
    const response = await api.get(`/instructor/courses/${courseId}/approval-status`);
    return response.data;
  },

  // Sections
  createSection: async (courseId: number, dto: CreateSectionDto): Promise<Section> => {
    const response = await api.post<Section>(`/instructor/courses/${courseId}/sections`, dto);
    return response.data;
  },

  updateSection: async (sectionId: number, dto: CreateSectionDto): Promise<Section> => {
    const response = await api.put<Section>(`/instructor/sections/${sectionId}`, dto);
    return response.data;
  },

  deleteSection: async (sectionId: number): Promise<void> => {
    await api.delete(`/instructor/sections/${sectionId}`);
  },

  // Lessons
  createLesson: async (sectionId: number, dto: CreateLessonDto): Promise<Lesson> => {
    const response = await api.post<Lesson>(`/instructor/sections/${sectionId}/lessons`, dto);
    return response.data;
  },

  updateLesson: async (lessonId: number, dto: Partial<CreateLessonDto>): Promise<Lesson> => {
    const response = await api.put<Lesson>(`/instructor/lessons/${lessonId}`, dto);
    return response.data;
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    await api.delete(`/instructor/lessons/${lessonId}`);
  },

  uploadLessonVideo: async (lessonId: number, file: File, durationSeconds?: number): Promise<Lesson> => {
    const formData = new FormData();
    formData.append('file', file);
    if (durationSeconds) {
      formData.append('durationSeconds', durationSeconds.toString());
    }
    const response = await api.post<Lesson>(
      `/instructor/lessons/${lessonId}/video`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  uploadLessonResource: async (
    lessonId: number,
    courseId: number,
    title: string,
    type: number,
    externalUrl?: string,
    file?: File
  ): Promise<CourseResource> => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('courseId', courseId.toString());
    formData.append('type', type.toString());
    if (externalUrl) formData.append('externalUrl', externalUrl);
    if (file) formData.append('file', file);

    const response = await api.post<CourseResource>(
      `/instructor/lessons/${lessonId}/resources`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  deleteResource: async (resourceId: number): Promise<void> => {
    await api.delete(`/instructor/resources/${resourceId}`);
  },
};
