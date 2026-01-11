
import { Form } from '@/types';
import { Check, ThumbsUp, Heart, Star, Trophy, PartyPopper, CheckCircle } from 'lucide-react';

const iconMap: Record<string, any> = {
  check: CheckCircle,
  thumbsUp: ThumbsUp,
  heart: Heart,
  star: Star,
  trophy: Trophy,
  party: PartyPopper,
};

interface ThankYouScreenEditorProps {
  currentForm: Form | null;
  updateForm: (updates: Partial<Form>) => void;
}

const iconColorClasses = {
  green: 'from-emerald-400 to-green-500 shadow-green-500/30',
  blue: 'from-blue-400 to-blue-500 shadow-blue-500/30',
  purple: 'from-purple-400 to-purple-500 shadow-purple-500/30',
  orange: 'from-orange-400 to-orange-500 shadow-orange-500/30',
  pink: 'from-pink-400 to-pink-500 shadow-pink-500/30',
  red: 'from-red-400 to-red-500 shadow-red-500/30',
  yellow: 'from-yellow-400 to-yellow-500 shadow-yellow-500/30',
  gray: 'from-gray-600 to-gray-800 shadow-gray-500/30',
  white: 'bg-white text-gray-900 border border-gray-100 shadow-gray-200',
};

export default function ThankYouScreenEditor({ currentForm, updateForm }: ThankYouScreenEditorProps) {
  if (!currentForm) return null;

  const settings = currentForm.thankYouSettings;
  const layout = settings?.layout || 'simple';
  const bgImage = settings?.backgroundImage;
  const iconColor = settings?.iconColor || 'green';
  const IconComponent = iconMap[(settings as any)?.icon || 'check'] || Check;

  const defaultTitle = 'Thank you!';
  const defaultMessage = 'Your submission has been received.';

  const renderContent = () => (
    <div className="flex flex-col items-center justify-center w-full text-center">
        {/* Inline Editable Title */}
        <div className="relative group w-full mb-3">
          <input
            type="text"
            className={`block w-full text-center text-3xl font-extrabold tracking-tight bg-transparent border-none focus:ring-0 placeholder-gray-300 focus:placeholder-gray-200 ${
                layout === 'cover' ? 'text-white placeholder-white/50' : 'text-gray-900'
            }`}
            value={settings?.title ?? defaultTitle}
            onChange={(e) => updateForm({
              thankYouSettings: {
                ...settings!,
                 title: e.target.value,
                 message: settings?.message || '',
                 buttonText: settings?.buttonText || 'Back to Home'
              }
            })}
            placeholder="Enter title..."
          />
          <div className={`absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/50' : ''
          }`} />
        </div>

        {/* Inline Editable Message */}
        <div className="relative group w-full max-w-lg">
          <textarea
            className={`block w-full text-center text-base font-medium tracking-wide leading-relaxed bg-transparent border-none focus:ring-0 resize-none min-h-[60px] placeholder-gray-300 focus:placeholder-gray-200 ${
                 layout === 'cover' ? 'text-white/80 placeholder-white/40' : 'text-gray-500'
            }`}
            value={settings?.message ?? defaultMessage}
            onChange={(e) => updateForm({
              thankYouSettings: {
                ...settings!,
                title: settings?.title || '',
                buttonText: settings?.buttonText || 'Back to Home',
                message: e.target.value
              }
            })}
            placeholder="Enter message..."
          />
           <div className={`absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/50' : ''
          }`} />
        </div>

        {/* Button Preview */}
        {settings?.showButton && (
          <div className="mt-6">
            <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm">
              {settings?.buttonText || 'Back to Home'}
            </button>
          </div>
        )}
    </div>
  );

  const renderImagePlaceholder = () => (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center min-h-[300px]">
          {bgImage && (
              <img src={bgImage} alt="Thank You" className="w-full h-full object-cover" />
          )}
      </div>
  );
  
  const successIcon = (
    <div className="relative mb-6">
      <div className={`w-20 h-20 bg-gradient-to-br ${iconColorClasses[iconColor]} rounded-full flex items-center justify-center shadow-lg`}>
        <IconComponent className="w-10 h-10 text-white" strokeWidth={3} />
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center w-full px-8">
      <div className="relative group max-w-xs w-full">
        <input
          type="text"
          className={`block w-full text-center text-xs bg-transparent border-none focus:ring-0 placeholder-gray-300 focus:placeholder-gray-200 transition-colors ${
              layout === 'cover' ? 'text-white/60 focus:text-white' : 'text-gray-400 focus:text-gray-600'
          }`}
          value={settings?.footerText ?? ''}
          onChange={(e) => updateForm({
            thankYouSettings: {
              ...settings!,
              footerText: e.target.value
            }
          })}
          placeholder="Click to add footer text..."
        />
         <div className={`absolute inset-0 border border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/30' : ''
          }`} />
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-full p-8 animate-in fade-in duration-500">
      <div className={`w-full ${layout === 'simple' ? 'max-w-3xl' : 'max-w-5xl'} bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden flex ${
          layout === 'split-left' ? 'flex-row' : 
          layout === 'split-right' ? 'flex-row-reverse' : 
          'flex-col'
      } relative min-h-[400px]`}>
        
        {/* SIMPLE CENTERED */}
        {layout === 'simple' && (
            <div className="flex flex-col items-center justify-center w-full py-16 px-8 space-y-6">
                 {bgImage ? (
                    <div className="w-48 h-48 mx-auto relative group">
                        <img src={bgImage} alt="Success" className="w-full h-full object-contain drop-shadow-sm" />
                    </div>
                 ) : (
                    successIcon
                 )}
                 {renderContent()}
            </div>
        )}

        {/* SPLIT LAYOUTS */}
        {(layout === 'split-left' || layout === 'split-right') && (
            <>
                <div className="w-1/2 relative">
                     {renderImagePlaceholder()}
                </div>
                <div className="w-1/2 flex flex-col items-center justify-center p-16 space-y-6">
                     <div className="scale-90 opacity-90">{successIcon}</div>
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
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-12">
                     <div className="mb-8">
                       <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                         <IconComponent className="w-12 h-12 text-white" strokeWidth={3} />
                       </div>
                     </div>
                     {renderContent()}
                </div>
            </div>
        )}

        {/* Footer */}
        {renderFooter()}

      </div>
    </div>
  );
}
