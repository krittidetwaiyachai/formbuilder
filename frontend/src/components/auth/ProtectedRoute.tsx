import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginModal from '@/components/auth/LoginModal';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <LoginModal 
            isOpen={true} 
            onClose={() => navigate('/')} 
            onSuccess={() => {
                
            }} 
        />
      </div>
    );
  }

  return <Outlet />;
}
