import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
  username?: string;
  onCreateForm: () => void;
  isCreating: boolean;
}

export default function DashboardHeader({ username, onCreateForm, isCreating }: DashboardHeaderProps) {
  return (
    <div className="flex-shrink-0 z-20 bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight"
            >
              Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-lg text-gray-500 font-medium"
            >
              Welcome back, {username || 'Creator'}. Here's what's happening.
            </motion.p>
          </div>
          
          <div className="relative z-30">
            <button
              onClick={onCreateForm}
              disabled={isCreating}
              className="px-10 py-4 bg-black text-white font-medium text-base border-2 border-black rounded-xl transition-all duration-300 cursor-pointer hover:bg-transparent hover:text-black hover:shadow-[0_0_25px_rgba(0,0,0,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Form
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
