'use client';

import { cn } from '@/lib/utils';
import type { DeviceType } from '@/types';

interface DeviceFrameProps {
  device: DeviceType;
  scale: number;
  children: React.ReactNode;
}

const deviceConfigs = {
  mobile: {
    width: 375,
    frameClass: 'rounded-[40px] p-3',
    screenClass: 'rounded-[32px]',
    notch: true,
  },
  tablet: {
    width: 768,
    frameClass: 'rounded-[24px] p-2',
    screenClass: 'rounded-[16px]',
    notch: false,
  },
  desktop: {
    width: 1024,
    frameClass: 'rounded-lg',
    screenClass: 'rounded-t-lg',
    notch: false,
  },
  wide: {
    width: 1440,
    frameClass: 'rounded-lg',
    screenClass: 'rounded-t-lg',
    notch: false,
  },
};

export function DeviceFrame({ device, scale, children }: DeviceFrameProps) {
  const config = deviceConfigs[device];
  const isMobileOrTablet = device === 'mobile' || device === 'tablet';

  return (
    <div
      className="transition-transform duration-300 ease-material-standard origin-top"
      style={{ transform: `scale(${scale})` }}
    >
      {isMobileOrTablet ? (
        // Mobile/Tablet Frame
        <div
          className={cn(
            'bg-gray-800 dark:bg-gray-900 shadow-material-4',
            config.frameClass
          )}
        >
          {/* Notch for mobile */}
          {config.notch && (
            <div className="flex justify-center mb-2">
              <div className="w-32 h-6 bg-gray-900 rounded-full" />
            </div>
          )}

          {/* Screen */}
          <div
            className={cn(
              'bg-white dark:bg-gray-950 overflow-hidden',
              config.screenClass
            )}
            style={{ width: config.width }}
          >
            {children}
          </div>

          {/* Home indicator for mobile */}
          {config.notch && (
            <div className="flex justify-center mt-2">
              <div className="w-24 h-1 bg-gray-600 rounded-full" />
            </div>
          )}
        </div>
      ) : (
        // Desktop/Wide Frame
        <div className="shadow-material-4">
          {/* Browser chrome */}
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-t-lg flex items-center gap-2 px-4">
            {/* Traffic lights */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>

            {/* URL bar */}
            <div className="flex-1 mx-4">
              <div className="h-6 bg-white dark:bg-gray-700 rounded-md px-3 flex items-center">
                <span className="text-body-sm text-gray-400">
                  localhost:3000
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className="bg-white dark:bg-gray-950 overflow-hidden border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg"
            style={{ width: config.width }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

