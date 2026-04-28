import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from "react";
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { useSocketLogout } from './hooks/useSocketLogout';
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FormEdit = lazy(() => import("./pages/FormEdit"));
const FormPreview = lazy(() => import("./pages/FormPreview"));
const PublicForm = lazy(() => import("./pages/PublicForm"));
const ActivityPage = lazy(() => import("./pages/ActivityPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBundles = lazy(() => import("./pages/admin/AdminBundles"));
const AdminForms = lazy(() => import("./pages/admin/AdminForms"));
const AdminBackup = lazy(() => import("./pages/admin/AdminBackup"));
const BundleEditor = lazy(() => import("./pages/admin/BundleEditor"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const prefetchDashboardRoute = () => import("./pages/Dashboard");
const prefetchFormEditRoute = () => import("./pages/FormEdit");

const routeFallback = (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
    Loading...
  </div>
);
function AppContent() {
  useInactivityLogout();
  useSocketLogout();
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/forms/:id/view" element={<PublicForm />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route element={<ProtectedRoute />}>
            <Route path="forms/:id/builder" element={<FormEdit />} />
            <Route path="forms/:id/activity" element={<ActivityPage />} />
            <Route path="forms/:id/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route element={<AdminProtectedRoute />}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bundles" element={<AdminBundles />} />
            <Route path="forms" element={<AdminForms />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="backup" element={<AdminBackup />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/bundles/:id" element={<BundleEditor />} />
        </Route>
        <Route path="forms/:id/preview" element={<FormPreview />} />
        <Route path="*" element={<ErrorPage code={404} />} />
      </Routes>
    </Suspense>);
}
function App() {
  useEffect(() => {
    type IdleWindow = Window & {
      requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const schedule = (cb: () => void) => {
      const idleWindow = window as IdleWindow;
      if (typeof idleWindow.requestIdleCallback === "function") {
        const idleId = idleWindow.requestIdleCallback(cb, { timeout: 2000 });
        return () => {
          if (typeof idleWindow.cancelIdleCallback === "function") {
            idleWindow.cancelIdleCallback(idleId);
          }
        };
      }
      const timeoutId = globalThis.setTimeout(cb, 1200);
      return () => {
        globalThis.clearTimeout(timeoutId);
      };
    };

    return schedule(() => {
      void prefetchDashboardRoute();
      void prefetchFormEditRoute();
    });
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
      <AppContent />
    </BrowserRouter>);
}
export default App;