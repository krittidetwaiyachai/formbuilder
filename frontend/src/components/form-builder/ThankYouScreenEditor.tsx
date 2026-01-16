
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

// Premium Icon Backgrounds
const iconStyles: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  gray: 'bg-gray-50 text-gray-900 border-gray-100',
  white: 'bg-white text-gray-900 border-gray-100 shadow-sm',
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
    <div className="flex flex-col items-center justify-center w-full text-center px-4">
        {/* Inline Editable Title */}
        <div className="relative group w-full mb-6">
          <input
            type="text"
            className={`block w-full text-center text-4xl md:text-5xl font-bold tracking-tight bg-transparent border-none focus:ring-0 placeholder-gray-300 focus:placeholder-gray-200 ${
                layout === 'cover' ? 'text-white placeholder-white/50 drop-shadow-md' : 'text-gray-900'
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
          <div className={`absolute -inset-2 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/50' : ''
          }`} />
        </div>

        {/* Inline Editable Message */}
        <div className="relative group w-full max-w-2xl">
          <textarea
            className={`block w-full text-center text-xl font-normal tracking-wide leading-relaxed bg-transparent border-none focus:ring-0 resize-none min-h-[80px] placeholder-gray-300 focus:placeholder-gray-200 ${
                 layout === 'cover' ? 'text-white/80 placeholder-white/40 drop-shadow' : 'text-gray-500'
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
           <div className={`absolute -inset-2 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/50' : ''
          }`} />
        </div>

        {/* Button Preview */}
        {settings?.showButton && (
          <div className="mt-8 flex justify-center">
             <div className="relative group">
                <input
                  type="text"
                  className={`block w-auto min-w-[200px] text-center text-lg font-bold rounded-full py-4 px-10 shadow-lg transition-all cursor-text border-none ${
                      layout === 'cover' 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                  value={settings?.buttonText || 'Back to Home'}
                  onChange={(e) => updateForm({
                    thankYouSettings: {
                      ...settings!,
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
      <div className="w-full h-full bg-gray-50 flex items-center justify-center min-h-[400px]">
          {bgImage ? (
              <img src={bgImage} alt="Thank You" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300 space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-500 opacity-50" />
                </div>
                <span className="text-sm font-medium tracking-widest text-gray-400 uppercase">Image Placeholder</span>
            </div>
          )}
      </div>
  );
  
  const successIcon = (
    <div className="relative mb-8">
      {/* Background Ripple Effect - Visual Only */}
      <div className={`absolute inset-0 rounded-full opacity-20 scale-110 ${
          iconColor === 'white' ? 'bg-gray-200' : iconStyles[iconColor]?.split(' ')[0]?.replace('bg-', 'bg-') || 'bg-emerald-200'
      }`} />
      
      <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center relative z-10 shadow-xl border-4 border-white ${iconStyles[iconColor] || iconStyles.green}`}>
        <IconComponent className="w-12 h-12" strokeWidth={2.5} />
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center w-full px-8">
      <div className="relative group max-w-xs w-full">
        <input
          type="text"
          className={`block w-full text-center text-xs font-medium tracking-wide bg-transparent border-none focus:ring-0 placeholder-gray-300 focus:placeholder-gray-200 transition-colors ${
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
         <div className={`absolute -inset-2 border border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded pointer-events-none transition-colors ${
             layout === 'cover' ? 'group-hover:border-white/30' : ''
          }`} />
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-full p-8 animate-in fade-in duration-500 w-full h-full bg-gray-50/50">
      <div className={`w-full ${layout === 'simple' ? 'max-w-4xl' : 'max-w-6xl'} bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-white overflow-hidden flex ${
          layout === 'split-left' ? 'flex-row' : 
          layout === 'split-right' ? 'flex-row-reverse' : 
          'flex-col'
      } relative min-h-[600px]`}>
        
        {/* SIMPLE CENTERED */}
        {layout === 'simple' && (
            <div className="flex flex-col items-center justify-center w-full py-16 px-8 relative">
                 {/* Decorative background blobs */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />

                 <div className="relative z-10 flex flex-col items-center w-full">
                    {bgImage ? (
                        <div className="w-48 h-48 mx-auto relative group mb-8">
                            <img src={bgImage} alt="Success" className="w-full h-full object-contain drop-shadow-sm" />
                        </div>
                    ) : (
                        successIcon
                    )}
                    {renderContent()}
                 </div>
            </div>
        )}

        {/* SPLIT LAYOUTS */}
        {(layout === 'split-left' || layout === 'split-right') && (
            <>
                <div className="w-1/2 relative">
                     {renderImagePlaceholder()}
                </div>
                <div className="w-1/2 flex flex-col items-center justify-center p-16 bg-white">
                     {successIcon}
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
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800" />
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-12">
                     <div className="mb-0">
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
