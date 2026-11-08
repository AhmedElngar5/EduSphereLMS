import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { InstructorLayout } from '../layouts/InstructorLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <LoadingSpinner size="md" message="Loading..." />
  </div>
);

const withSuspense = (Component: React.LazyExoticComponent<React.FC<any>>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// Public Pages
const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const CoursesCatalogPage = lazy(() => import('../pages/CoursesCatalogPage').then((m) => ({ default: m.CoursesCatalogPage })));
const CourseDetailPage = lazy(() => import('../pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const InstructorProfilePage = lazy(() => import('../pages/InstructorProfilePage').then((m) => ({ default: m.InstructorProfilePage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const AboutPage = lazy(() => import('../pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const CertificateVerifyPage = lazy(() => import('../pages/CertificateVerifyPage').then((m) => ({ default: m.CertificateVerifyPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Student Pages
const StudentDashboardPage = lazy(() => import('../pages/StudentDashboardPage').then((m) => ({ default: m.StudentDashboardPage })));
const MyCoursesPage = lazy(() => import('../pages/MyCoursesPage').then((m) => ({ default: m.MyCoursesPage })));
const LearningClassroomPage = lazy(() => import('../pages/LearningClassroomPage').then((m) => ({ default: m.LearningClassroomPage })));
const WishlistPage = lazy(() => import('../pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const PaymentHistoryPage = lazy(() => import('../pages/PaymentHistoryPage').then((m) => ({ default: m.PaymentHistoryPage })));
const CertificatesPage = lazy(() => import('../pages/CertificatesPage').then((m) => ({ default: m.CertificatesPage })));
const ProfileSettingsPage = lazy(() => import('../pages/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage })));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));

// Instructor Pages
const InstructorDashboardPage = lazy(() => import('../pages/InstructorDashboardPage').then((m) => ({ default: m.InstructorDashboardPage })));
const InstructorCoursesPage = lazy(() => import('../pages/InstructorCoursesPage').then((m) => ({ default: m.InstructorCoursesPage })));
const CreateCoursePage = lazy(() => import('../pages/CreateCoursePage').then((m) => ({ default: m.CreateCoursePage })));
const EditCoursePage = lazy(() => import('../pages/EditCoursePage').then((m) => ({ default: m.EditCoursePage })));
const CurriculumEditorPage = lazy(() => import('../pages/CurriculumEditorPage').then((m) => ({ default: m.CurriculumEditorPage })));
const EnrolledStudentsPage = lazy(() => import('../pages/EnrolledStudentsPage').then((m) => ({ default: m.EnrolledStudentsPage })));
const EarningsPage = lazy(() => import('../pages/EarningsPage').then((m) => ({ default: m.EarningsPage })));
const CoursePerformancePage = lazy(() => import('../pages/CoursePerformancePage').then((m) => ({ default: m.CoursePerformancePage })));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const ManageUsersPage = lazy(() => import('../pages/ManageUsersPage').then((m) => ({ default: m.ManageUsersPage })));
const ManageInstructorsPage = lazy(() => import('../pages/ManageInstructorsPage').then((m) => ({ default: m.ManageInstructorsPage })));
const ManageCoursesPage = lazy(() => import('../pages/ManageCoursesPage').then((m) => ({ default: m.ManageCoursesPage })));
const PendingApprovalsPage = lazy(() => import('../pages/PendingApprovalsPage').then((m) => ({ default: m.PendingApprovalsPage })));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const OrdersPaymentsPage = lazy(() => import('../pages/OrdersPaymentsPage').then((m) => ({ default: m.OrdersPaymentsPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));

export const router = createBrowserRouter([
  // 1. Public Storefront & Marketing
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'courses', element: withSuspense(CoursesCatalogPage) },
      { path: 'courses/:slug', element: withSuspense(CourseDetailPage) },
      { path: 'instructors/:id', element: withSuspense(InstructorProfilePage) },
      { path: 'login', element: withSuspense(LoginPage) },
      { path: 'register', element: withSuspense(RegisterPage) },
      { path: 'forgot-password', element: withSuspense(ForgotPasswordPage) },
      { path: 'about', element: withSuspense(AboutPage) },
      { path: 'contact', element: withSuspense(ContactPage) },
      { path: 'verify-certificate', element: withSuspense(CertificateVerifyPage) },
      { path: 'verify-certificate/:certificateNumber', element: withSuspense(CertificateVerifyPage) },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },

  // 2. Student Portal
  {
    path: '/student',
    element: (
      <ProtectedRoute>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: withSuspense(StudentDashboardPage) },
      { path: 'my-courses', element: withSuspense(MyCoursesPage) },
      { path: 'wishlist', element: withSuspense(WishlistPage) },
      { path: 'payments', element: withSuspense(PaymentHistoryPage) },
      { path: 'certificates', element: withSuspense(CertificatesPage) },
      { path: 'profile', element: withSuspense(ProfileSettingsPage) },
      { path: 'notifications', element: withSuspense(NotificationsPage) },
    ],
  },

  // 3. Immersive Classroom Player (No standard headers/footers)
  {
    path: '/student/learn/:courseId',
    element: (
      <ProtectedRoute>
        {withSuspense(LearningClassroomPage)}
      </ProtectedRoute>
    ),
  },

  // 4. Instructor Studio
  {
    path: '/instructor',
    element: (
      <ProtectedRoute allowedRoles={['Instructor', 'Admin']}>
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: withSuspense(InstructorDashboardPage) },
      { path: 'courses', element: withSuspense(InstructorCoursesPage) },
      { path: 'courses/new', element: withSuspense(CreateCoursePage) },
      { path: 'courses/:id/edit', element: withSuspense(EditCoursePage) },
      { path: 'courses/:id/curriculum', element: withSuspense(CurriculumEditorPage) },
      { path: 'students', element: withSuspense(EnrolledStudentsPage) },
      { path: 'earnings', element: withSuspense(EarningsPage) },
      { path: 'performance', element: withSuspense(CoursePerformancePage) },
    ],
  },

  // 5. Admin Control Center
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: withSuspense(AdminDashboardPage) },
      { path: 'users', element: withSuspense(ManageUsersPage) },
      { path: 'instructors', element: withSuspense(ManageInstructorsPage) },
      { path: 'courses', element: withSuspense(ManageCoursesPage) },
      { path: 'courses/pending', element: withSuspense(PendingApprovalsPage) },
      { path: 'categories', element: withSuspense(CategoriesPage) },
      { path: 'orders', element: withSuspense(OrdersPaymentsPage) },
      { path: 'reports', element: withSuspense(ReportsPage) },
    ],
  },
]);
