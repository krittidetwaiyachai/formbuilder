import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FormEdit from './pages/FormEdit';
import FormPreview from './pages/FormPreview';
import PublicForm from './pages/PublicForm';
import Layout from './components/Layout';
import ActivityPage from './pages/ActivityPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/forms/:id/view" element={<PublicForm />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="forms/:id/builder" element={<FormEdit />} />
             <Route path="forms/:id/activity" element={<ActivityPage />} />
             <Route path="forms/:id/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>
        <Route path="forms/:id/preview" element={<FormPreview />} />
        <Route path="*" element={<ErrorPage code={404} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

