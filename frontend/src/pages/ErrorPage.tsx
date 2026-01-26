import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Home, AlertCircle, Lock, Server, Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
    code = 404, 
    title, 
    message
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  
  const getErrorConfig = (code: number) => {
    switch (code) {
        case 403:
            return {
                icon: Lock,
                defaultTitle: t('error.403.title'),
                defaultMessage: t('error.403.message'),
                color: "text-rose-400",
                bgGlow: "rgba(225, 29, 72, 0.15)",
                borderColor: "border-rose-500/20",
                iconBg: "bg-rose-500/10",
                footer: t('error.footer.security', 'Security Protocol • Access Level: Restricted')
            };
        case 500:
            return {
                icon: Server,
                defaultTitle: t('error.500.title'),
                defaultMessage: t('error.500.message'),
                color: "text-amber-400",
                bgGlow: "rgba(251, 191, 36, 0.15)",
                borderColor: "border-amber-500/20",
                iconBg: "bg-amber-500/10",
                footer: t('error.footer.diagnostic', 'System Diagnostic • Status: Critical')
            };
        case 503:
            return {
                icon: Construction,
                defaultTitle: t('error.503.title'),
                defaultMessage: t('error.503.message'),
                color: "text-cyan-400",
                bgGlow: "rgba(34, 211, 238, 0.15)",
                borderColor: "border-cyan-500/20",
                iconBg: "bg-cyan-500/10",
                footer: t('error.footer.upgrade', 'System Upgrade • Estimating Time: Unknown')
            };
        case 404:
        default:
            return {
                icon: AlertCircle,
                defaultTitle: t('error.404.title'),
                defaultMessage: t('error.404.message'),
                color: "text-indigo-400",
                bgGlow: "rgba(79, 70, 229, 0.15)",
                borderColor: "border-indigo-500/20",
                iconBg: "bg-indigo-500/10",
                footer: t('error.footer.default', 'FormBuilder • 404 Error')
            };
    }
  };

  const config = getErrorConfig(code);
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
        const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
        mouseX.set(x);
        mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const xContent = useTransform(mouseX, [-1, 1], [-30, 30]);
  const yContent = useTransform(mouseY, [-1, 1], [-20, 20]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white overflow-hidden relative selection:bg-indigo-500/30 font-sans">
        
      { }
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none"
        style={{
            background: `radial-gradient(circle 800px at ${springX.get() * 20 + 50}% ${springY.get() * 20 + 50}%, ${config.bgGlow}, transparent 60%)`
        }}
      />
      
      { }
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0 opacity-50" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] w-full px-4 py-8">
        
        { }
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
             <motion.h1 
                style={{ x: xContent, y: yContent, fontSize: 'clamp(6rem, 15vw, 20rem)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="font-bold leading-none tracking-tighter text-zinc-900/50"
             >
                {code}
             </motion.h1>
        </div>

        { }
        <motion.div 
            className="relative z-20 flex flex-col items-center text-center max-w-lg w-full scale-[0.85] md:scale-90 2xl:scale-100 origin-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
        >
            { }
             <motion.div 
                className={`mb-6 p-4 rounded-3xl ${config.iconBg} border ${config.borderColor} backdrop-blur-sm shadow-2xl`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
             >
                <Icon className={`w-8 h-8 md:w-12 md:h-12 ${config.color}`} strokeWidth={1.5} />
             </motion.div>

            { }
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-3 md:mb-4 drop-shadow-xl">
                {displayTitle}
            </h2>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 max-w-sm mx-auto">
                {displayMessage}
            </p>

            { }
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="group relative px-5 py-2.5 md:px-6 md:py-3 bg-white text-indigo-950 rounded-xl font-semibold text-sm md:text-base transition-all hover:bg-indigo-50 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                >
                    <Home className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>{t('error.back_home')}</span>
                </button>
                
                <button
                    onClick={() => window.history.back()}
                    className="px-5 py-2.5 md:px-6 md:py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl font-medium text-sm md:text-base hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
                >
                    {t('error.go_back')}
                </button>
            </div>

        </motion.div>
      </div>
      
      { }
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.5, duration: 1 }}
         className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"
      >
        <p className="text-[9px] md:text-[10px] text-zinc-600 font-mono tracking-[0.3em] uppercase opacity-70">
            {config.footer}
        </p>
      </motion.div>
      
    </div>
  );
};

export default ErrorPage;
