
import { motion } from 'framer-motion';
import { Plus, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UserAvatar from '@/components/common/UserAvatar';
import { useAuthStore } from '@/store/authStore';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';


interface DashboardHeaderProps {
  username?: string;
  onCreateForm: () => void;
  isCreating: boolean;
  onLogin?: () => void;
  onProfileClick?: () => void;
}

export default function DashboardHeader({ username, onCreateForm, isCreating, onLogin, onProfileClick }: DashboardHeaderProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  
  return (
    <>
      <div className="flex-shrink-0 z-20 bg-white md:border-b md:border-gray-200 relative">
        { }
        <div className="md:hidden px-5 pt-12 pb-4 safe-area-pt">
          <div className="flex items-center justify-between mb-4">
            {user ? (
              <div 
                className="flex items-center gap-3 active:opacity-70 transition-opacity cursor-pointer"
                onClick={onProfileClick} 
              >
                <UserAvatar user={user} className="h-10 w-10 ring-2 ring-gray-100" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">{t('dashboard.welcome_back')}</p>
                  <p className="text-sm font-bold text-gray-900">{username || t('common.user')}</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-semibold active:opacity-80 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                {t('auth.sign_in')}
              </button>
            )}
            <LanguageSwitcher />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[34px] font-bold text-black tracking-tight"
          >
            {t('dashboard')}
          </motion.h1>
        </div>
        
        { }
        <div className="hidden md:block max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight pt-2"
                style={{ lineHeight: '1.3' }}
              >
                {t('dashboard')}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-3 text-lg text-gray-500 font-medium"
                style={{ lineHeight: '1.6' }}
              >
                {username ? t('dashboard.welcome', { username }) : t('dashboard.welcome_default')}
              </motion.p>
            </div>
            
            <div className="relative z-30">
              <button
                  onClick={onCreateForm}
                  disabled={isCreating}
                  className="uiverse-star-button relative px-8 py-3 bg-black text-white text-lg font-medium border-2 border-black rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center"
              >
                  <Plus className="w-5 h-5 mr-2" />
                  {t('dashboard.create_form')}
                  <div className="star-1">
                      <StarSvg />
                  </div>
                  <div className="star-2">
                      <StarSvg />
                  </div>
                  <div className="star-3">
                      <StarSvg />
                  </div>
                  <div className="star-4">
                      <StarSvg />
                  </div>
                  <div className="star-5">
                      <StarSvg />
                  </div>
                  <div className="star-6">
                      <StarSvg />
                  </div>
              </button>
              <style>{`
                  .uiverse-star-button {
                      position: relative;
                      z-index: 1;
                      overflow: visible;
                      box-shadow: 0 0 0 rgba(0,0,0,0);
                  }
                  .uiverse-star-button:hover {
                      transform: scale(1.05);
                      box-shadow: 0 0 25px rgba(0,0,0,0.3);
                  }
                  .uiverse-star-button .star-1,
                  .uiverse-star-button .star-2,
                  .uiverse-star-button .star-3,
                  .uiverse-star-button .star-4,
                  .uiverse-star-button .star-5,
                  .uiverse-star-button .star-6 {
                      position: absolute;
                      width: 25px;
                      height: auto;
                      filter: drop-shadow(0 0 4px rgba(0,0,0,0.8));
                      z-index: -5;
                      transition: all 0.4s ease-in-out;
                      opacity: 0;
                  }
                  
                  .star-1 { top: 20%; left: 20%; width: 25px; }
                  .star-2 { top: 45%; left: 45%; width: 15px; }
                  .star-3 { top: 40%; left: 40%; width: 5px; }
                  .star-4 { top: 20%; left: 40%; width: 8px; }
                  .star-5 { top: 25%; left: 45%; width: 15px; }
                  .star-6 { top: 5%; left: 50%; width: 5px; }

                  .uiverse-star-button:hover .star-1 {
                      position: absolute;
                      top: -80%;
                      left: -30%;
                      width: 25px;
                      z-index: 2;
                      opacity: 1;
                      transition: all 1s cubic-bezier(0.05, 0.83, 0.43, 0.96);
                  }
                  .uiverse-star-button:hover .star-2 {
                      position: absolute;
                      top: -25%;
                      left: 10%;
                      width: 15px;
                      z-index: 2;
                      opacity: 1;
                      transition: all 1s cubic-bezier(0, 0.4, 0, 1.01);
                  }
                  .uiverse-star-button:hover .star-3 {
                      position: absolute;
                      top: 55%;
                      left: 25%;
                      width: 5px;
                      z-index: 2;
                      opacity: 1;
                      transition: all 1s cubic-bezier(0, 0.4, 0, 1.01);
                  }
                  .uiverse-star-button:hover .star-4 {
                      position: absolute;
                      top: 30%;
                      left: 80%;
                      width: 8px;
                      z-index: 2;
                      opacity: 1;
                      transition: all 0.8s cubic-bezier(0, 0.4, 0, 1.01);
                  }
                  .uiverse-star-button:hover .star-5 {
                      position: absolute;
                      top: 25%;
                      left: 115%;
                      width: 15px;
                      z-index: 2;
                      opacity: 1;
                      transition: all 0.6s cubic-bezier(0, 0.4, 0, 1.01);
                  }
                  .uiverse-star-button:hover .star-6 {
                      position: absolute;
                      top: 5%;
                      left: 60%;
                      width: 5px;
                      z-index: 2;
                      opacity: 1;
                      transition: all 0.8s ease;
                  }
              `}</style>
            </div>
          </div>
        </div>
      </div>
      { }
    </>
  );
}

const StarSvg = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      version="1.1"
      style={{
          shapeRendering: 'geometricPrecision',
          textRendering: 'geometricPrecision',
          imageRendering: 'auto',
          fillRule: 'evenodd',
          clipRule: 'evenodd'
      }}
      viewBox="0 0 784.11 815.53"
    >
      <defs></defs>
      <g id="Layer_x0020_1">
        <path
          className="fil0"
          d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
          fill="#ffffff"
        ></path>
      </g>
    </svg>
);
