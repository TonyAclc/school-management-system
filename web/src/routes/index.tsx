import { createBrowserRouter, Navigate } from 'react-router';
import { requireAuthLoader, requireRolesLoader, redirectIfAuthenticatedLoader } from './loaders';

import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AppShell } from '../components/AppShell';
import { UsersListPage } from '../pages/UsersListPage';
import { UserFormPage } from '../pages/UserFormPage';
import { StudentsListPage } from '../pages/StudentsListPage';
import { StudentFormPage } from '../pages/StudentFormPage';
import { TeachersListPage } from '../pages/TeachersListPage';
import { TeacherFormPage } from '../pages/TeacherFormPage';
import { SubjectsListPage } from '../pages/SubjectsListPage';
import { SubjectFormPage } from '../pages/SubjectFormPage';
import { ClassesListPage } from '../pages/ClassesListPage';
import { ClassFormPage } from '../pages/ClassFormPage';
import { ClassDetailPage } from '../pages/ClassDetailPage';
import { AttendancePage } from '../pages/AttendancePage';
import { GradesPage } from '../pages/GradesPage';
import { DashboardPage } from '../pages/DashboardPage';

const ForbiddenPage = () => <div>Forbidden</div>;
const NotFoundPage = () => <div>Not Found</div>;
const RouteErrorBoundary = () => <div>Route Error</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Public
      { path: 'login', loader: redirectIfAuthenticatedLoader, element: <LoginPage /> },
      { path: 'register', loader: redirectIfAuthenticatedLoader, element: <RegisterPage /> },

      // Authenticated layout
      {
        loader: requireAuthLoader,
        element: <AppShell />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },

          // Admin only
          {
            path: 'users',
            loader: requireRolesLoader('ADMIN'),
            children: [
              { index: true, element: <UsersListPage /> },
              { path: 'new', element: <UserFormPage /> },
              { path: ':id/edit', element: <UserFormPage /> },
            ],
          },
          {
            path: 'teachers',
            loader: requireRolesLoader('ADMIN'),
            children: [
              { index: true, element: <TeachersListPage /> },
              { path: 'new', element: <TeacherFormPage /> },
              { path: ':id/edit', element: <TeacherFormPage /> },
            ],
          },

          // Admin or teacher
          {
            path: 'students',
            loader: requireRolesLoader('ADMIN', 'TEACHER', 'STAFF'),
            children: [
              { index: true, element: <StudentsListPage /> },
              { path: 'new', element: <StudentFormPage /> },
              { path: ':id/edit', element: <StudentFormPage /> },
            ],
          },
          {
            path: 'subjects',
            loader: requireRolesLoader('ADMIN'),
            children: [
              { index: true, element: <SubjectsListPage /> },
              { path: 'new', element: <SubjectFormPage /> },
              { path: ':id/edit', element: <SubjectFormPage /> },
            ],
          },
          {
            path: 'classes',
            loader: requireRolesLoader('ADMIN', 'TEACHER', 'STAFF'),
            children: [
              { index: true, element: <ClassesListPage /> },
              { path: 'new', element: <ClassFormPage /> },
              { path: ':id/edit', element: <ClassFormPage /> },
              { path: ':id', element: <ClassDetailPage /> },
            ],
          },
          { path: 'attendance', loader: requireRolesLoader('ADMIN', 'TEACHER'), element: <AttendancePage /> },

          // Any authenticated user
          { path: 'grades', element: <GradesPage /> },
        ],
      },

      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
