import { useEffect, useState } from 'react';
import { socket } from '../../lib/socket';
import settingService from '../../services/settingService';

export type BannerType = 'home' | 'rental' | 'success';

interface BannerProps {
  type: BannerType;
}

export default function Banner({ type }: BannerProps) {
  const [banner, setBanner] = useState<{ message: string; fontSize: number }>({ message: '', fontSize: 18 });

  useEffect(() => {
    async function fetchBanner() {
      const settings = await settingService.getPublicSettings();
      if (type === 'home') setBanner(settings.bannerContent);
      else if (type === 'rental') setBanner(settings.rentalPageBanner);
      else if (type === 'success') setBanner(settings.successPageBanner);
    }
    fetchBanner();
    socket.on('settings:update', (newSettings: any) => {
      if (type === 'home') setBanner(newSettings.bannerContent);
      else if (type === 'rental') setBanner(newSettings.rentalPageBanner);
      else if (type === 'success') setBanner(newSettings.successPageBanner);
    });
    return () => {
      socket.off('settings:update');
    };
  }, [type]);

  if (!banner.message) return null;
  let bgColor = 'bg-yellow-400';
  let textColor = 'text-black';
  if (type === 'rental' || type === 'success') {
    bgColor = 'bg-green-600';
    textColor = 'text-white';
  }
  return (
    <div className={`w-full ${bgColor} ${textColor} py-2 overflow-hidden`}>
      <div
        className="whitespace-nowrap animate-marquee-fast"
        style={{ fontSize: banner.fontSize }}
      >
        {banner.message}
      </div>
    </div>
  );
}
