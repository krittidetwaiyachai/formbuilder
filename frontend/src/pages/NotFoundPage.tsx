import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Mouse tracking for subtle parallax
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

  const x404 = useTransform(mouseX, [-1, 1], [-30, 30]);
  const y404 = useTransform(mouseY, [-1, 1], [-20, 20]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white overflow-hidden relative selection:bg-indigo-500/30 font-sans">
        
      {/* 1. Subtle Indigo Background Glow */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none"
        style={{
            background: `radial-gradient(circle 800px at ${springX.get() * 20 + 50}% ${springY.get() * 20 + 50}%, rgba(79, 70, 229, 0.15), transparent 60%)`
        }}
      />
      
      {/* 2. Professional Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0 opacity-50" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4">
        
        {/* 3. 404 Background Text - Clean & Bold */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
             <motion.h1 
                style={{ x: x404, y: y404 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-[18rem] md:text-[28rem] font-bold leading-none tracking-tighter text-zinc-900/50"
             >
                404
             </motion.h1>
        </div>

        {/* 4. Main Content Card */}
        <motion.div 
            className="relative z-20 flex flex-col items-center text-center max-w-xl w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
        >
            {/* Icon */}
             <motion.div 
                className="mb-8 p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm shadow-[0_0_30px_-10px_rgba(79,70,229,0.3)]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
             >
                <AlertCircle className="w-12 h-12 text-indigo-400" strokeWidth={1.5} />
             </motion.div>

            {/* Text */}
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-xl">
                {t('error.404.title')}
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-sm mx-auto">
                {t('error.404.message')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="group relative px-6 py-3 bg-white text-indigo-950 rounded-xl font-semibold text-base transition-all hover:bg-indigo-50 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                >
                    <Home className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>{t('error.back_home')}</span>
                </button>
                
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl font-medium text-base hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
                >
                    {t('error.go_back')}
                </button>
            </div>

        </motion.div>
      </div>
      
    </div>
  );
};

export default NotFoundPage;
