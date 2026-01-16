import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '../ui/toaster';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.access_token);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: t('auth.login_failed'),
        description: t('auth.invalid_credentials'),
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      const res = await api.post('/auth/google/login', { token: credentialResponse.credential });
      login(res.data.user, res.data.access_token);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: t('auth.google_failed'),
        description: t('auth.google_error'),
        variant: "error",
      });
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-xl">
      {/* Mobile: Full Screen */}
      <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="min-h-screen px-6 pt-14 pb-10 safe-area-pt safe-area-pb">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 active:bg-gray-200 transition-colors safe-area-pt"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="mt-8">
            <h1 className="text-[32px] font-bold text-black mb-2">{t('auth.sign_in')}</h1>
            <p className="text-gray-500 text-base mb-8">{t('auth.sign_in_subtitle')}</p>

            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast({
                    title: t('auth.google_failed'),
                    description: t('auth.google_error'),
                    variant: "error",
                  });
                }}
                useOneTap
                theme="outline"
                shape="pill"
                size="large"
                width={320}
              />
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-400">{t('auth.or_continue')}</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-100 border-0 rounded-xl text-base text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
                  placeholder={t('auth.email_placeholder')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-100 border-0 rounded-xl text-base text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
                  placeholder={t('auth.password_placeholder')}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 rounded-full font-semibold text-base active:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? t('auth.signing_in') : t('auth.sign_in_button')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Desktop: Modal */}
      <div className="hidden md:block relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[600px] overflow-hidden animate-in fade-in zoom-in duration-500">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all group"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:rotate-90 group-hover:text-black transition-all duration-300" />
        </button>

        <div className="flex h-full">
          <div className="relative w-1/2 bg-black overflow-hidden">
            <div className="absolute -right-24 top-0 bottom-0 w-48 bg-black transform skew-x-[-8deg] z-10"></div>
            <div className="relative z-20 h-full flex flex-col justify-center px-16">
              <div className="space-y-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-6xl font-black text-white leading-none mb-3">
                    {t('auth.welcome_back').split(' ').map((word, i) => (
                      <React.Fragment key={i}>{word}{i === 0 && <br />}</React.Fragment>
                    ))}
                  </h1>
                  <div className="w-20 h-1 bg-white"></div>
                </div>
                <p className="text-gray-400 text-lg font-medium">
                  {t('auth.sign_in_subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-1/2 bg-white p-16 flex items-center">
            <div className="w-full max-w-sm mx-auto">
              <h2 className="text-3xl font-bold text-black mb-8">{t('auth.sign_in')}</h2>

              <div className="mb-8 p-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast({
                      title: t('auth.google_failed'),
                      description: t('auth.google_error'),
                      variant: "error",
                    });
                  }}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  size="large"
                  width={350}
                  logo_alignment="left"
                />
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-black/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm font-bold text-black/40 uppercase tracking-wider">{t('auth.or_continue')}</span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-black/60 mb-3 uppercase tracking-wider">{t('auth.email')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-0 py-3 border-0 border-b-2 border-black/20 focus:border-black transition-all outline-none bg-transparent text-black placeholder-black/30 text-lg"
                    placeholder={t('auth.email_placeholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/60 mb-3 uppercase tracking-wider">{t('auth.password')}</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-0 py-3 border-0 border-b-2 border-black/20 focus:border-black transition-all outline-none bg-transparent text-black placeholder-black/30 text-lg"
                    placeholder={t('auth.password_placeholder')}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-4 rounded-2xl hover:bg-black/80 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 uppercase tracking-wider"
                >
                  {isLoading ? t('auth.signing_in') : t('auth.sign_in_button')}
                </button>
              </form>

              <p className="mt-8 text-xs text-black/40 text-center leading-relaxed">
                Protected by bye
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

