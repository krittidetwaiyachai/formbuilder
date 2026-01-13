import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '../ui/toaster';
import { useTranslation } from 'react-i18next';

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.user, data.access_token);
        // toast({
        //   title: "Welcome back!",
        //   description: "Successfully signed in.",
        //   variant: "success",
        // });
        onSuccess();
        onClose();
      } else {
        toast({
          title: t('auth.login_failed'),
          description: t('auth.invalid_credentials'),
          variant: "error",
        });
      }
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: t('auth.error'),
        description: t('auth.error_message'),
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.user, data.access_token);
        // toast({
        //   title: "Welcome back!",
        //   description: "Successfully signed in with Google.",
        //   variant: "success",
        // });
        onSuccess();
        onClose();
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[600px] overflow-hidden animate-in fade-in zoom-in duration-500">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
        >
          <X className="w-5 h-5 text-white group-hover:rotate-90 transition-all duration-300" />
        </button>

        <div className="flex h-full">
          {/* LEFT SIDE - Black Minimal Section */}
          <div className="relative w-1/2 bg-black overflow-hidden">
            {/* Diagonal Cut Effect */}
            <div className="absolute -right-24 top-0 bottom-0 w-48 bg-black transform skew-x-[-8deg] z-10"></div>
            
            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-center px-16">
              <div className="space-y-8">
                {/* Simple Icon */}
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                {/* Bold Typography */}
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

          {/* RIGHT SIDE - White Form Section */}
          <div className="relative w-1/2 bg-white p-16 flex items-center">
            <div className="w-full max-w-sm mx-auto">
              <h2 className="text-3xl font-bold text-black mb-8">{t('auth.sign_in')}</h2>

              {/* Google Sign In */}
              <div className="mb-8 p-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    console.log('Login Failed');
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

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-black/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm font-bold text-black/40 uppercase tracking-wider">{t('auth.or_continue')}</span>
                </div>
              </div>

              {/* Email Login Form */}
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

              {/* Terms */}
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
