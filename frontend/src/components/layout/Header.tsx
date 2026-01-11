import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut, } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import LoginModal from '@/components/auth/LoginModal';
import UserAvatar from '@/components/common/UserAvatar'; // Import

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Close profile menu when auth state changes (e.g. login/logout)
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-300 flex-shrink-0 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
              <FileText className="h-8 w-8 text-black" />
              <span className="ml-2 text-xl font-bold text-black">
                Form Builder
              </span>
            </Link>

          </div>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">
                <div 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 pr-2 pl-1 py-1 rounded-full transition-all duration-300 border border-gray-200 group cursor-pointer relative z-40"
                >
                  <UserAvatar 
                    user={user || {}} 
                    className="h-8 w-8 group-hover:scale-105 transition-transform duration-300 border-2 border-white shadow-sm"
                  />
                  <div className="hidden md:block text-left mr-1">
                    <p className="text-sm font-bold text-gray-800 leading-none">
                      {user?.firstName || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 mt-0.5">
                      {user?.role}
                    </p>
                  </div>
                </div>

                {/* Profile Popup */}
                 {isProfileMenuOpen && (
                  <>
                    <div 
                        className="fixed inset-0 z-30 bg-transparent" 
                        onClick={() => setIsProfileMenuOpen(false)} 
                    />
                    <div 
                        className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-40 origin-top-right animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
                             <UserAvatar 
                               user={user || {}} 
                               className="h-10 w-10 shadow-sm" 
                             />
                             <div className="overflow-hidden">
                                 <p className="text-sm font-bold text-gray-900 truncate">
                                    {user?.firstName} {user?.lastName}
                                 </p>
                                 <p className="text-xs text-gray-500 truncate">
                                    {user?.email}
                                 </p>
                             </div>
                        </div>
                        
                        <div className="space-y-1">
                             <button
                               onClick={handleLogout}
                               className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                             >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                             </button>
                        </div>
                    </div>
                  </>
                 )}
                
                {/* Logout Button (Hidden from main view to reduce clutter, moved to popup, or keep as quick access? User asked for popup. Let's hide the direct button to clean up, or keep it? User didn't say to remove it, but it makes sense to have it in the popup. I'll hide the direct button for cleaner UI) */}
                {/* 
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button> 
                */}
              </div>
            ) : (
              <div className="relative group/btn">
                {/* Floating Particles */}
                <div className="absolute -inset-10 pointer-events-none overflow-hidden z-20">
                  
                  {/* Star 1: Yellow - Top Right (Float & Twinkle) */}
                  <svg 
                    className="absolute w-4 h-4 text-yellow-300 opacity-60 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: '30%',
                      left: '75%',
                      animation: 'float-1 3s ease-in-out infinite, twinkle 2s ease-in-out infinite'
                    }}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                  </svg>

                  {/* Star 2: Pink - Top Left (Spin & Pulse) */}
                  <svg 
                    className="absolute w-3.5 h-3.5 text-pink-300 opacity-50 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: '25%',
                      left: '25%',
                      animation: 'float-2 4s ease-in-out infinite, spin-slow 6s linear infinite'
                    }}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                  </svg>

                  {/* Star 3: Purple - Bottom Left (Float Wide) */}
                  <svg 
                    className="absolute w-3 h-3 text-purple-300 opacity-60 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: '65%',
                      left: '20%',
                      animation: 'float-3 5s ease-in-out infinite, pulse 3s ease-in-out infinite'
                    }}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                  </svg>

                  {/* Star 4: Blue - Bottom Right (Spin Reverse) */}
                  <svg 
                    className="absolute w-3.5 h-3.5 text-blue-300 opacity-50 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: '70%',
                      left: '80%',
                      animation: 'float-4 4s ease-in-out infinite, spin-reverse 8s linear infinite'
                    }}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                  </svg>

                  {/* Star 5: White - Center Top (High twinkle) */}
                  <svg 
                    className="absolute w-2.5 h-2.5 text-white opacity-70 group-hover/btn:opacity-100 transition-all duration-500"
                    style={{
                      top: '10%',
                      left: '50%',
                      filter: 'drop-shadow(0 0 2px white)',
                      animation: 'float-2 3s ease-in-out infinite, twinkle 1s ease-in-out infinite'
                    }}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                  </svg>

                  <style>
                    {`
                      @keyframes float-1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-5px, -8px); } }
                      @keyframes float-2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(5px, -5px); } }
                      @keyframes float-3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-8px, 5px); } }
                      @keyframes float-4 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(8px, 8px); } }
                      
                      @keyframes twinkle { 
                        0%, 100% { opacity: 0.4; transform: scale(0.8); } 
                        50% { opacity: 1; transform: scale(1.2); } 
                      }

                      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                      @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                      @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }

                      @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(100%); }
                        100% { transform: translateX(100%); }
                      }
                      
                      @keyframes pulse-ring {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2); }
                        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
                      }
                    `}
                  </style>
                </div>

                {/* Main Button with z-10 */}
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="relative z-10 overflow-hidden inline-flex items-center justify-center px-6 py-2.5 font-bold text-white transition-all duration-300 bg-gray-900 rounded-full focus:outline-none hover:bg-black hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    animation: 'pulse-ring 3s infinite cubic-bezier(0.4, 0, 0.6, 1)'
                  }}
                >
                  {/* Shimmer Effect */}
                  <div 
                    className="absolute inset-0 w-full h-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 3s infinite'
                    }}
                  />
                  
                  <span className="relative flex items-center gap-2 z-10">
                    Sign in
                    <svg 
                      className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </nav>
  );
}
