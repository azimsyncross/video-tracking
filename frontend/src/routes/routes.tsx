import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { Layout } from '@/components/layout';

// Lazy load components
const Home = lazy(() => import('@/features/home/Home'));
const Login = lazy(() => import('@/features/auth/Login'));
const Register = lazy(() => import('@/features/auth/Register'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const Playlists = lazy(() => import('@/features/playlists/Playlists'));
const SuperAdminDashboard = lazy(() => import('@/features/superAdmin/Dashboard'));
const Profile = lazy(() => import('@/features/user/Profile'));
const NotFound = lazy(() => import('@/components/common/NotFound'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public routes
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      
      // Protected routes (require authentication)
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/playlists',
        element: (
          <ProtectedRoute>
            <Playlists />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },

      // Super admin routes
      {
        path: '/super-admin',
        element: (
          <RoleRoute roles={['superAdmin']}>
            <SuperAdminDashboard />
          </RoleRoute>
        ),
      },

      // 404 route
      { path: '*', element: <NotFound /> },
    ],
  },
]; 