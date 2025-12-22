import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, FileText, LogOut, User } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isFormBuilder = location.pathname.includes('/builder');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={isFormBuilder ? "h-screen flex flex-col bg-white overflow-hidden" : "min-h-screen bg-white"}>
      <nav className="bg-white border-b border-gray-300 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex items-center">
                <FileText className="h-8 w-8 text-black" />
                <span className="ml-2 text-xl font-bold text-black">
                  Form Builder
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-black hover:text-gray-700"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <User className="h-4 w-4 mr-2 text-gray-700" />
                <span className="text-sm text-black">
                  {user?.firstName || user?.email}
                </span>
                <span className="ml-2 text-xs text-gray-600">
                  ({user?.role.name})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-800 text-sm leading-4 font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className={isFormBuilder ? "flex-1 overflow-hidden" : "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-white overflow-hidden"}>
        <Outlet />
      </main>
    </div>
  );
}

