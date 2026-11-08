export type UserRole = 'Student' | 'Instructor' | 'Admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  headline?: string;
  profilePictureUrl?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  headline?: string;
  profilePictureUrl?: string;
  roles: string[];
  expiresAtUtc: string;
}

export type CourseLevel = 'AllLevels' | 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Published' | 'Rejected' | 'Archived';
export type LessonType = 'Video' | 'Article' | 'Quiz' | 'Assignment';
export type ResourceType = 'Document' | 'SourceCode' | 'Exercise' | 'ExternalLink';
export type EnrollmentStatus = 'Active' | 'Completed' | 'Dropped' | 'Expired';
export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Refunded' | 'Failed';
export type PaymentStatus = 'Pending' | 'Succeeded' | 'Failed' | 'Refunded';

export type NotificationType =
  | 'CourseEnrollment'
  | 'CourseCompletion'
  | 'NewLesson'
  | 'PaymentConfirmed'
  | 'PaymentFailed'
  | 'CertificateIssued'
  | 'ReviewReceived'
  | 'SystemAlert'
  | 'CourseApproved'
  | 'CourseRejected';

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentCategoryId?: number;
  displayOrder: number;
  courseCount: number;
  subCategories: Category[];
}

export interface CourseSummary {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  instructorId: string;
  instructorName: string;
  instructorTitle?: string;
  instructorPictureUrl?: string;
  categoryId: number;
  categoryName: string;
  level: CourseLevel;
  status: CourseStatus;
  thumbnailUrl?: string;
  price: number;
  discountPrice?: number;
  isFree: boolean;
  totalDurationSeconds: number;
  totalLessons: number;
  enrolledCount: number;
  averageRating: number;
  totalReviews: number;
  publishedAtUtc?: string;
  createdAtUtc: string;
}

export interface CourseDetail extends CourseSummary {
  description: string;
  language?: string;
  previewVideoUrl?: string;
  requirements?: string;
  whatYouWillLearn?: string;
  whoIsThisFor?: string;
  rejectionReason?: string;
  sections: Section[];
  resources: CourseResource[];
}

export interface Section {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  displayOrder: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  sectionId: number;
  title: string;
  description?: string;
  type: LessonType;
  displayOrder: number;
  isPreviewFree: boolean;
  durationSeconds?: number;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  contentHtml?: string;
  resources?: CourseResource[];
}

export interface CourseResource {
  id: number;
  courseId: number;
  lessonId?: number;
  title: string;
  type: ResourceType;
  fileUrl?: string;
  externalUrl?: string;
  fileExtension?: string;
  fileSizeBytes?: number;
  displayOrder: number;
}

export interface StudentLessonDetail {
  id: number;
  sectionId: number;
  sectionTitle: string;
  courseId: number;
  courseTitle: string;
  title: string;
  description?: string;
  type: LessonType;
  displayOrder: number;
  isPreviewFree: boolean;
  durationSeconds?: number;
  videoStreamUrl?: string;
  videoThumbnailUrl?: string;
  contentHtml?: string;
  watchedDurationSeconds: number;
  progressStatus: 'NotStarted' | 'InProgress' | 'Completed';
  isCompleted: boolean;
  completedAtUtc?: string;
  previousLessonId?: number;
  nextLessonId?: number;
  resources: CourseResource[];
}

export interface CourseLearningProgress {
  courseId: number;
  courseTitle: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  enrolledAtUtc: string;
  lastAccessedAtUtc?: string;
  completedAtUtc?: string;
  sections: SectionProgress[];
}

export interface SectionProgress {
  id: number;
  title: string;
  displayOrder: number;
  lessons: LessonProgressItem[];
}

export interface LessonProgressItem {
  id: number;
  sectionId: number;
  title: string;
  displayOrder: number;
  type: LessonType;
  durationSeconds?: number;
  isPreviewFree: boolean;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  watchedDurationSeconds: number;
  isCompleted: boolean;
  completedAtUtc?: string;
}

export interface ContinueLearning {
  courseId: number;
  courseTitle: string;
  lessonId: number;
  lessonTitle: string;
  sectionId: number;
  sectionTitle: string;
  watchedDurationSeconds: number;
  durationSeconds?: number;
  courseProgressPercentage: number;
}

export interface Enrollment {
  id: number;
  userId: string;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  courseThumbnailUrl?: string;
  instructorName: string;
  categoryName: string;
  status: EnrollmentStatus;
  pricePaid: number;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  enrolledAtUtc: string;
  lastAccessedAtUtc?: string;
  completedAtUtc?: string;
  nextLessonId?: number;
  nextLessonTitle?: string;
}

export interface EnrollmentStatusDto {
  isEnrolled: boolean;
  status?: EnrollmentStatus;
  progressPercentage?: number;
  enrolledAtUtc?: string;
  completedAtUtc?: string;
}

export interface CheckoutResult {
  orderId: number;
  paymentId: number;
  courseId: number;
  courseTitle: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentGateway: string;
  paymentStatus: PaymentStatus;
  gatewayTransactionId: string;
  simulateSuccessUrl: string;
  simulateFailureUrl: string;
}

export interface Order {
  id: number;
  userId: string;
  courseId: number;
  courseTitle: string;
  courseThumbnailUrl?: string;
  status: OrderStatus;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
  createdAtUtc: string;
  paymentId?: number;
  paymentStatus?: PaymentStatus;
  paymentGateway?: string;
}

export interface Payment {
  id: number;
  orderId: number;
  courseId: number;
  courseTitle: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentGateway?: string;
  gatewayTransactionId?: string;
  receiptUrl?: string;
  failureReason?: string;
  paidAtUtc?: string;
  createdAtUtc: string;
}

export interface Certificate {
  id: number;
  certificateNumber: string;
  courseId: number;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  issuedAtUtc: string;
  downloadUrl: string;
  verificationUrl: string;
}

export interface CertificateVerification {
  isValid: boolean;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAtUtc: string;
  verificationMessage: string;
}

export interface Review {
  id: number;
  courseId: number;
  userId: string;
  studentName: string;
  studentPictureUrl?: string;
  rating: number;
  comment?: string;
  createdAtUtc: string;
  lastModifiedAtUtc?: string;
}

export interface WishlistItem {
  id: number;
  courseId: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  instructorName: string;
  categoryName: string;
  price: number;
  discountPrice?: number;
  isFree: boolean;
  averageRating: number;
  totalReviews: number;
  addedAtUtc: string;
}

export interface NotificationItem {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  readAtUtc?: string;
  createdAtUtc: string;
}

export interface InstructorEarningsSummary {
  instructorId: string;
  totalSalesCount: number;
  totalRevenue: number;
  instructorEarnings: number;
  platformFee: number;
  courseBreakdown: {
    courseId: number;
    courseTitle: string;
    salesCount: number;
    totalRevenue: number;
    instructorEarnings: number;
  }[];
  recentTransactions: {
    orderId: number;
    courseTitle: string;
    studentName: string;
    amount: number;
    instructorEarnings: number;
    paidAtUtc: string;
  }[];
}

export interface AdminPaymentReport {
  totalGrossRevenue: number;
  totalNetPlatformRevenue: number;
  totalInstructorPayouts: number;
  totalCompletedOrders: number;
  totalFailedOrders: number;
  totalPendingOrders: number;
  recentPayments: Payment[];
}
