import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceContext = createContext();

export function DeviceProvider({ children }) {
  // 自動偵測裝置類型（依螢幕寬度與 Touch/UserAgent 自動判定，不可手動切換）
  const [deviceInfo, setDeviceInfo] = useState(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true, deviceType: 'desktop', width: 1200 };
    }
    const width = window.innerWidth;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = width <= 768;
    const isTablet = width > 768 && width <= 1024;
    const isDesktop = width > 1024;
    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      width,
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
    };
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        width,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
      });
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <DeviceContext.Provider value={deviceInfo}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    return {
      isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
      isTablet: false,
      isDesktop: true,
      deviceType: 'desktop'
    };
  }
  return context;
}
