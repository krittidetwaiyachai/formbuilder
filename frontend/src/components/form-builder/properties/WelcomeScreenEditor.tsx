
import { Form } from '@/types';
import { Check, ThumbsUp, Heart, Star, Trophy, PartyPopper, Rocket, Sparkles } from 'lucide-react';

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

// For Welcome Screen, we use softer, glowy backgrounds or text colors
const iconGlowClasses: Record<string, string> = {
  green: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  pink: 'bg-pink-100 text-pink-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  gray: 'bg-gray-100 text-gray-600',
  white: 'bg-white text-gray-900 border border-gray-100 shadow-sm',
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
  const iconColor = (settings as any)?.iconColor || 'blue'; // Default to blue for Welcome
  const IconComponent = iconMap[(settings as any)?.icon || 'sparkles'] || Sparkles; // Default to Sparkles for Welcome

  const renderContent = () => (
      <div className="max-w-2xl w-full text-center space-y-6 p-8">
        {/* Icon Placeholder - New "Hero" Style */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${iconGlowClasses[iconColor]} bg-opacity-50 backdrop-blur-sm`}>
             <IconComponent className="w-10 h-10" strokeWidth={2} />
          </div>
        </div>

        {/* Inline Editable Title */}
        <div className="relative group">
          <input
            type="text"
            className={`block w-full text-center text-3xl font-extrabold border-none bg-transparent focus:ring-0 placeholder-gray-300 focus:placeholder-gray-200 ${
                 layout === 'cover' ? 'text-white placeholder-white/50' : 'text-gray-900'
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
          <div className={`absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/50' : ''
          }`} />
        </div>

        {/* Inline Editable Description */}
        <div className="relative group">
          <textarea
            className={`block w-full text-center text-base border-none bg-transparent focus:ring-0 resize-none min-h-[80px] placeholder-gray-300 focus:placeholder-gray-200 ${
                 layout === 'cover' ? 'text-white/90 placeholder-white/50' : 'text-gray-500'
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
          <div className={`absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/50' : ''
          }`} />
        </div>

        {/* Start Button */}
        {currentForm?.welcomeSettings?.showStartButton !== false && (
          <div className="flex justify-center pt-2">
            <div className="relative group">
              <input
                type="text"
                className="block w-40 text-center text-base font-bold text-white bg-black rounded-full py-2.5 px-6 shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all cursor-text border-none"
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
              <div className="absolute -inset-2 border-2 border-transparent group-hover:border-dashed group-hover:border-blue-200 rounded-full pointer-events-none transition-colors" />
            </div>
          </div>
        )}
      </div>
  );

  const renderImagePlaceholder = () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center min-h-[400px]">
          {bgImage ? (
              <img src={bgImage} alt="Welcome" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-sm">No Image</span>
            </div>
          )}
      </div>
  );

  return (
    <div className="flex items-center justify-center min-h-full p-8 animate-in fade-in duration-500 w-full h-full">
         <div className={`w-full ${layout === 'simple' ? 'max-w-xl' : 'max-w-4xl'} bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden flex ${
          layout === 'split-left' ? 'flex-row' : 
          layout === 'split-right' ? 'flex-row-reverse' : 
          'flex-col'
      } relative min-h-[400px]`}>
        
        {/* SIMPLE CENTERED */}
        {layout === 'simple' && (
             <div className="w-full flex items-center justify-center">
                {renderContent()}
             </div>
        )}

        {/* SPLIT LAYOUTS */}
        {(layout === 'split-left' || layout === 'split-right') && (
            <>
                <div className="w-1/2 relative bg-gray-50 border-r border-gray-100">
                     {renderImagePlaceholder()}
                </div>
                <div className="w-1/2 flex flex-col items-center justify-center">
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
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                     {renderContent()}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
