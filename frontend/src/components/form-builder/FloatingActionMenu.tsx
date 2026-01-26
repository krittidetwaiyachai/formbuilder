
import React from 'react';
import { Image, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FloatingActionMenuProps {
  onAddImage: () => void;
  onAddVideo: () => void;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  onAddImage,
  onAddVideo,
}) => {
  const { t } = useTranslation();
  return (
    <div className="absolute -right-16 top-0 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 z-40 transition-opacity duration-200 animate-in fade-in slide-in-from-left-4">
      <button 
        onClick={(e) => { e.stopPropagation(); onAddImage(); }} 
        className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 transition-colors group"
        title={t('builder.floating.add_image')}
      >
        <Image className="w-5 h-5" />
      </button>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onAddVideo(); }} 
        className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 transition-colors group"
        title={t('builder.floating.add_video')}
      >
        <Video className="w-5 h-5" />
      </button>
    </div>
  );
};
