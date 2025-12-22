import { ReactNode, useState } from 'react';
import { RotateCcw } from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceFrameProps {
  device: DeviceType;
  children: ReactNode;
}

export default function DeviceFrame({ device, children }: DeviceFrameProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const deviceConfig: {
    desktop: { width: string; maxWidth: string; padding: string };
    tablet: { portrait: { width: string; height: string; maxWidth: string; padding: string }; landscape: { width: string; height: string; maxWidth: string; padding: string } };
    mobile: { portrait: { width: string; height: string; maxWidth: string; padding: string }; landscape: { width: string; height: string; maxWidth: string; padding: string } };
  } = {
    desktop: {
      width: '100%',
      maxWidth: '720px',
      padding: 'p-4',
    },
    tablet: {
      portrait: {
        width: '480px',
        height: '640px',
        maxWidth: '480px',
        padding: 'p-4',
      },
      landscape: {
        width: '640px',
        height: '480px',
        maxWidth: '640px',
        padding: 'p-4',
      },
    },
    mobile: {
      portrait: {
        width: '430px',
        height: '932px',
        maxWidth: '430px',
        padding: 'p-5',
      },
      landscape: {
        width: '932px',
        height: '430px',
        maxWidth: '932px',
        padding: 'p-5',
      },
    },
  };

  const getConfig = () => {
    if (device === 'desktop') {
      return deviceConfig.desktop;
    }
    return deviceConfig[device][orientation];
  };

  const config = getConfig();
  const isMobileOrTablet = device === 'tablet' || device === 'mobile';
  const deviceConfigValue = isMobileOrTablet ? (config as any) : config;

  // Render desktop browser frame - Using actual image frame
  if (device === 'desktop') {
    // ใช้รูปภาพจริง - วางไฟล์รูปภาพใน frontend/public/desktop-frame.png
    const desktopFrameImage = '/desktop-frame.png';

    return (
      <div className="flex justify-center items-start bg-transparent p-4 sm:p-8 py-8">
        {/* Frame Container - ใช้รูปภาพจริง */}
        <div
          className="relative"
          style={{
            width: config.width,
            maxWidth: config.maxWidth,
            height: '600px', // กำหนด height ให้ชัดเจน
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
          }}
        >
          {/* Screen Area - พื้นที่แสดงเนื้อหา (transparent ในรูปภาพ) */}
          <div
            className="absolute overflow-hidden bg-white"
            style={{
              width: '92%',
              height: '82%',
              top: '9%',
              left: '4%',
              zIndex: 1,
            }}
          >
            {/* Screen Content */}
            <div className="bg-white w-full h-full overflow-y-auto relative">
              {/* Content Padding */}
              <div className={config.padding}>{children}</div>
            </div>
          </div>

          {/* รูปภาพกรอบ desktop - อยู่ด้านบนสุด */}
          <img 
            src={desktopFrameImage}
            alt="Desktop frame"
            className="absolute inset-0 pointer-events-none"
            style={{ 
              zIndex: 10,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    );
  }

  // Render tablet frame - Using actual image frame
  if (device === 'tablet') {
    const isLandscape = orientation === 'landscape';
    const frameWidth = isLandscape ? '650px' : '500px';
    const frameHeight = isLandscape ? '500px' : '650px';
    // ลดขนาดหน้าจอให้เล็กลงเพื่อไม่ให้เกินกรอบรูป
    const screenWidth = isLandscape ? '600px' : '450px';
    const screenHeight = isLandscape ? '450px' : '600px';

    // ใช้รูปภาพจริง - วางไฟล์รูปภาพใน frontend/public/tablet-frame.png
    const tabletFrameImage = '/tablet-frame.png'; // หรือใช้ phone-frame.png ถ้ายังไม่มีรูป tablet

    return (
      <div className="flex flex-col items-center bg-transparent p-4 sm:p-8 py-8">
        {/* Rotate Button - Above device */}
        <button
          onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
          className="mb-4 bg-white shadow-lg hover:bg-gray-50 transition-all duration-200 h-10 w-10 rounded-md border border-gray-300 flex items-center justify-center"
          title={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'} mode`}
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        
        {/* Frame Container - ใช้รูปภาพจริง */}
        <div
          className="relative"
          style={{
            width: frameWidth,
            height: frameHeight,
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
          }}
        >
          {/* Screen Area - พื้นที่แสดงเนื้อหา (transparent ในรูปภาพ) */}
          <div
            className="absolute overflow-hidden bg-white"
            style={{
              width: screenWidth,
              height: screenHeight,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              borderRadius: '2rem',
            }}
          >
            {/* Screen Content */}
            <div className="bg-white w-full h-full overflow-y-auto relative" style={{ borderRadius: 'inherit' }}>
              {/* Content Padding */}
              <div className={deviceConfigValue.padding}>{children}</div>
            </div>
          </div>

          {/* รูปภาพกรอบ tablet - อยู่ด้านหน้า (เพื่อให้กรอบทับเนื้อหา) */}
          <img 
            src={tabletFrameImage}
            alt="Tablet frame"
            className="absolute inset-0 pointer-events-none"
            style={{ 
              zIndex: 10,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: !isLandscape 
                ? 'rotate(90deg) scale(1.3)' 
                : 'scale(1.0)',
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>
    );
  }

  // Render mobile frame - Using actual image frame
  if (device === 'mobile') {
    const isLandscape = orientation === 'landscape';
    // Reduced size: ~50% of original iPhone 17 Pro Max dimensions
    const frameWidth = isLandscape ? '475px' : '220px';
    const frameHeight = isLandscape ? '220px' : '475px';
    // ปรับขนาดหน้าจอให้เล็กลงเพื่อไม่ให้เกินกรอบโทรศัพท์
    const screenWidth = isLandscape ? '442px' : '204px';
    const screenHeight = isLandscape ? '204px' : '442px';

    // ใช้รูปภาพจริง - วางไฟล์รูปภาพใน frontend/public/phone-frame.png
    const phoneFrameImage = '/phone-frame.png';

    return (
      <div className="flex flex-col items-center bg-transparent p-4 sm:p-8 py-8">
        {/* Rotate Button - Above device */}
        <button
          onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
          className="mb-4 bg-white shadow-lg hover:bg-gray-50 transition-all duration-200 h-10 w-10 rounded-md border border-gray-300 flex items-center justify-center"
          title={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'} mode`}
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        
        {/* Frame Container - ใช้รูปภาพจริง */}
        <div
          className="relative"
          style={{
            width: frameWidth,
            height: frameHeight,
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
          }}
        >
          {/* Screen Area - พื้นที่แสดงเนื้อหา (transparent ในรูปภาพ) */}
          <div
            className="absolute overflow-hidden bg-white"
            style={{
              width: screenWidth,
              height: screenHeight,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              borderRadius: '2.5rem',
            }}
          >
            {/* Screen Content */}
            <div className="bg-white w-full h-full overflow-y-auto relative" style={{ borderRadius: 'inherit' }}>
              {/* Content Padding */}
              <div className={`${deviceConfigValue.padding} ${isLandscape && device === 'mobile' ? 'pt-12 pl-14' : ''}`}>
                {children}
              </div>
            </div>
          </div>

          {/* รูปภาพกรอบโทรศัพท์ - อยู่ด้านหน้า (เพื่อให้กรอบทับเนื้อหา) */}
          <img 
            src={phoneFrameImage}
            alt="Phone frame"
            className="absolute inset-0 pointer-events-none"
            style={{ 
              zIndex: 10,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: isLandscape 
                ? 'rotate(-90deg) scale(2.05)' 
                : 'none',
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}

