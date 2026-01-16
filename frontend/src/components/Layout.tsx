import { Outlet, useLocation } from 'react-router-dom';
import Header from './layout/Header';

export default function Layout() {
  const location = useLocation();
  const isFullScreen = location.pathname.includes('/builder') || location.pathname.includes('/dashboard');
  const isDashboard = location.pathname.includes('/dashboard');


  return (
    <div className={isFullScreen ? "h-screen flex flex-col bg-white overflow-hidden" : "min-h-screen bg-white"}>
      <div className={isDashboard ? "hidden md:block" : ""}>
        <Header />
      </div>
      <main className={isFullScreen ? "flex-1 overflow-hidden relative" : "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-white overflow-hidden"}>
        <Outlet />
      </main>
    </div>
  );
}
