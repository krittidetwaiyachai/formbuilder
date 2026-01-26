
import { ReactNode, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceFrameProps {
  device: DeviceType;
  children: ReactNode;
}

export default function DeviceFrame({ device, children }: DeviceFrameProps) {
  const { t } = useTranslation();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  
  
  
  const dimensions = {
    mobile: {
      portrait: { width: 393, height: 852 },
      landscape: { width: 852, height: 393 }
    },
    tablet: {
      portrait: { width: 820, height: 1180 },
      landscape: { width: 1180, height: 820 }
    }
  };

  const getDeviceStyle = () => {
    if (device === 'desktop') return {};
    
    const dim = dimensions[device][orientation];
    
    
    
    let scale = 1;
    if (device === 'tablet') {
        scale = 0.6; 
    } else if (device === 'mobile') {
        scale = 0.85; 
    }

    return {
       width: dim.width,
       height: dim.height,
       transform: `scale(${scale})`,
       transformOrigin: 'top center',
       marginBottom: `-${dim.height * (1 - scale)}px` 
    };
  };



  
  if (device === 'desktop') {
    return (
      <div className="flex justify-center items-start bg-transparent p-4 sm:p-8 py-8 w-full">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 isolate" style={{ transform: 'translateZ(0)' }}>
           { }
           <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded-md h-6 mx-4 border border-gray-200"></div>
           </div>
           
           { }
           <div className="h-[800px] overflow-y-auto bg-white relative">
              {children}
           </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="flex flex-col items-center justify-center bg-transparent p-8 w-full h-full">
       <button
          onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
          className="mb-4 bg-white shadow-md hover:bg-gray-50 transition-all duration-200 h-10 px-4 rounded-full border border-gray-200 flex items-center gap-2 text-sm font-medium z-10"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{t('public.preview.rotate')}</span>
        </button>

        <div 
          className="relative transition-all duration-500 ease-in-out"
          style={getDeviceStyle()}
        >
            { }
            <div 
              className={`absolute inset-0 bg-gray-900 shadow-2xl pointer-events-none custom-device-shadow ${device === 'mobile' ? 'rounded-[3rem]' : 'rounded-[2rem]'}`}
              style={{
                 
              }}
            >
               { }
            </div>

            { }
            <div 
               className={`absolute bg-gray-50 overflow-hidden ${device === 'mobile' ? 'rounded-[2.5rem] top-[6px] bottom-[6px] left-[6px] right-[6px]' : 'rounded-[1.5rem] top-[12px] bottom-[12px] left-[12px] right-[12px]'}`}
               style={{ transform: 'translateZ(0)' }}
            >
               { }
               <div 
                  className={`w-full h-full overflow-y-auto overflow-x-hidden select-none ${device === 'mobile' ? 'pt-10 pb-8' : 'pt-6 pb-4'}`}
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent'
                  }}
               >
                  {children}
               </div>
            </div>
            
            { }
            {device === 'mobile' && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-1/3 h-1.5 bg-gray-950/20 rounded-full pointer-events-none z-20 mix-blend-multiply"></div>
            )}
        </div>
    </div>
  );
}

