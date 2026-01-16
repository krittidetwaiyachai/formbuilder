
import { Form } from '@/types';
import { Check, ThumbsUp, Heart, Star, Trophy, PartyPopper, Rocket, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = {
  check: Check,
  thumbsUp: ThumbsUp,
  heart: Heart,
  star: Star,
  trophy: Trophy,
  party: PartyPopper,
  rocket: Rocket,
  sparkles: Sparkles,
};

// Premium, standardized icon backgrounds
const iconStyles: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  gray: 'bg-gray-50 text-gray-700 border-gray-100',
  white: 'bg-white text-black border-gray-100 shadow-sm',
};

interface WelcomeScreenEditorProps {
  currentForm: Form | null;
  updateForm: (updates: Partial<Form>) => void;
}

export default function WelcomeScreenEditor({ currentForm, updateForm }: WelcomeScreenEditorProps) {
  if (!currentForm) return null;

  const settings = currentForm.welcomeSettings;
  const layout = settings?.layout || 'simple';
  const bgImage = settings?.backgroundImage;
  const iconColor = (settings as any)?.iconColor || 'blue';
  const IconComponent = iconMap[(settings as any)?.icon || 'sparkles'] || Sparkles;

  const renderContent = () => (
      <div className="max-w-2xl w-full text-center space-y-8 p-12">
        {/* Icon Placeholder - Premium Style */}
        <div className="flex justify-center mb-8">
          <div className={`w-28 h-28 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl ${iconStyles[iconColor] || iconStyles.blue}`}>
             <IconComponent className="w-12 h-12" strokeWidth={1.5} />
          </div>
        </div>

        {/* Inline Editable Title */}
        <div className="relative group">
          <input
            type="text"
            className={`block w-full text-center text-4xl md:text-5xl font-bold tracking-tight leading-tight border-none bg-transparent focus:ring-0 placeholder-gray-300 focus:placeholder-gray-200 ${
                 layout === 'cover' ? 'text-white placeholder-white/50 drop-shadow-md' : 'text-gray-900'
            }`}
            value={currentForm?.welcomeSettings?.title || ''}
            onChange={(e) => updateForm({
              welcomeSettings: {
                ...currentForm?.welcomeSettings,
                title: e.target.value,
                description: currentForm?.welcomeSettings?.description || '',
                buttonText: currentForm?.welcomeSettings?.buttonText || 'Start',
                showStartButton: currentForm?.welcomeSettings?.showStartButton ?? true
              }
            })}
            placeholder="Click to edit title"
          />
          <div className={`absolute -inset-2 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/50' : ''
          }`} />
        </div>

        {/* Inline Editable Description */}
        <div className="relative group">
          <textarea
            className={`block w-full text-center text-xl font-normal border-none bg-transparent focus:ring-0 resize-none min-h-[80px] placeholder-gray-300 focus:placeholder-gray-200 leading-relaxed ${
                 layout === 'cover' ? 'text-white/90 placeholder-white/50 drop-shadow' : 'text-gray-500'
            }`}
            value={currentForm?.welcomeSettings?.description || ''}
            onChange={(e) => updateForm({
              welcomeSettings: {
                ...currentForm?.welcomeSettings,
                title: currentForm?.welcomeSettings?.title || '',
                buttonText: currentForm?.welcomeSettings?.buttonText || 'Start',
                showStartButton: currentForm?.welcomeSettings?.showStartButton ?? true,
                description: e.target.value
              }
            })}
            placeholder="Click to add a description..."
          />
          <div className={`absolute -inset-2 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/50' : ''
          }`} />
        </div>

        {/* Start Button */}
        {currentForm?.welcomeSettings?.showStartButton !== false && (
          <div className="flex justify-center pt-4">
            <div className="relative group">
              <input
                type="text"
                className={`block w-auto min-w-[160px] text-center text-lg font-bold rounded-full py-4 px-10 shadow-xl transition-all cursor-text border-none ${
                    layout === 'cover' 
                    ? 'bg-white text-black hover:bg-white/90 shadow-lg' 
                    : 'bg-black text-white hover:bg-gray-800 shadow-gray-200'
                }`}
                value={currentForm?.welcomeSettings?.buttonText || 'Start'}
                onChange={(e) => updateForm({
                  welcomeSettings: {
                    ...currentForm?.welcomeSettings,
                    title: currentForm?.welcomeSettings?.title || '',
                    description: currentForm?.welcomeSettings?.description || '',
                    showStartButton: currentForm?.welcomeSettings?.showStartButton ?? true,
                    buttonText: e.target.value
                  }
                })}
              />
              <div className="absolute -inset-2 border-2 border-transparent group-hover:border-dashed group-hover:border-blue-400 rounded-full pointer-events-none transition-colors" />
            </div>
          </div>
        )}
      </div>
  );

  const renderImagePlaceholder = () => (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center min-h-[500px]">
          {bgImage ? (
              <img src={bgImage} alt="Welcome" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300 space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                    <IconComponent className="w-8 h-8 opacity-20" />
                </div>
                <span className="text-sm font-medium tracking-widest text-gray-400 uppercase">Image Placeholder</span>
            </div>
          )}
      </div>
  );

  return (
    <div className="flex items-center justify-center min-h-full p-8 animate-in fade-in duration-500 w-full h-full bg-gray-50/50">
         <div className={`w-full ${layout === 'simple' ? 'max-w-6xl' : 'max-w-7xl'} bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden flex ${
          layout === 'split-left' ? 'flex-row' : 
          layout === 'split-right' ? 'flex-row-reverse' : 
          'flex-col'
      } relative min-h-[600px] border border-white`}>
        
        {/* SIMPLE CENTERED */}
        {layout === 'simple' && (
             <div className="w-full h-full flex items-center justify-center relative">
                 {/* Decorative blobs */}
                 <div className="absolute top-0 left-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />
                 
                 <div className="relative z-10 w-full flex justify-center">
                    {renderContent()}
                 </div>
             </div>
        )}

        {/* SPLIT LAYOUTS */}
        {(layout === 'split-left' || layout === 'split-right') && (
            <>
                <div className="w-1/2 relative bg-gray-50 border-gray-100">
                     {renderImagePlaceholder()}
                </div>
                <div className="w-1/2 flex flex-col items-center justify-center bg-white">
                     {renderContent()}
                </div>
            </>
        )}

        {/* COVER LAYOUT */}
        {layout === 'cover' && (
            <div className="absolute inset-0 w-full h-full">
                {bgImage ? (
                     <img src={bgImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-gray-900" />
                )}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
                     {renderContent()}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
