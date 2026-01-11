
import { ReactNode, useState } from 'react';
import { RotateCcw } from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceFrameProps {
  device: DeviceType;
  children: ReactNode;
}

export default function DeviceFrame({ device, children }: DeviceFrameProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Realistic device dimensions (based on common viewports)
  // Mobile: iPhone 14 Pro (393x852)
  // Tablet: iPad Air (820x1180) - Scaled down for viewing
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
    
    // Scale down to fit in view if needed, but keep internal resolution correct
    // Mobile usually fits, Tablet needs scaling
    let scale = 1;
    if (device === 'tablet') {
        scale = 0.6; // Scale down tablet to fit on most screens
    } else if (device === 'mobile') {
        scale = 0.85; // Slight scale for mobile to fit comfortablt
    }

    return {
       width: dim.width,
       height: dim.height,
       transform: `scale(${scale})`,
       transformOrigin: 'top center',
       marginBottom: `-${dim.height * (1 - scale)}px` // Negative margin to reclaim space lost by scaling
    };
  };



  // Render desktop browser frame
  if (device === 'desktop') {
    return (
      <div className="flex justify-center items-start bg-transparent p-4 sm:p-8 py-8 w-full">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
           {/* Browser Header Mockup */}
           <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded-md h-6 mx-4 border border-gray-200"></div>
           </div>
           
           {/* Content */}
           <div className="h-[800px] overflow-y-auto bg-white relative">
              {children}
           </div>
        </div>
      </div>
    );
  }

  // Common wrapper for tablet/mobile
  return (
    <div className="flex flex-col items-center justify-center bg-transparent p-8 w-full h-full">
       <button
          onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
          className="mb-4 bg-white shadow-md hover:bg-gray-50 transition-all duration-200 h-10 px-4 rounded-full border border-gray-200 flex items-center gap-2 text-sm font-medium z-10"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Rotate</span>
        </button>

        <div 
          className="relative transition-all duration-500 ease-in-out"
          style={getDeviceStyle()}
        >
            {/* Device Bezel */}
            <div 
              className={`absolute inset-0 bg-gray-900 shadow-2xl pointer-events-none custom-device-shadow ${device === 'mobile' ? 'rounded-[3rem]' : 'rounded-[2rem]'}`}
              style={{
                 // Add specific styles if needed
              }}
            >
               {/* Camera Notch/Island simulation would go here if detailed */}
            </div>

            {/* Screen Area */}
            <div 
               className={`absolute bg-white overflow-hidden ${device === 'mobile' ? 'rounded-[2.5rem] top-[6px] bottom-[6px] left-[6px] right-[6px]' : 'rounded-[1.5rem] top-[12px] bottom-[12px] left-[12px] right-[12px]'}`}
            >
               <div className="w-full h-full overflow-hidden select-none">
                  {children}
               </div>
            </div>
            
            {/* Home Bar (iOS style) */}
            {device === 'mobile' && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-1/3 h-1.5 bg-gray-950/20 rounded-full pointer-events-none z-20 mix-blend-multiply"></div>
            )}
        </div>
    </div>
  );
}

