import React from 'react';
import { renderToString } from 'react-dom/server';
import AdminDashboard from '../src/components/AdminDashboard.jsx';
import { AuthContext } from '../src/context/AuthContext.jsx';
import { GameContext } from '../src/context/GameContext.jsx';
import { DeviceContext } from '../src/context/DeviceContext.jsx';

const mockAuth = {
  currentUser: {
    id: 'admin_test_id',
    name: '總管理員',
    displayName: '總管理員',
    email: 'jimmylee1020227@gmail.com',
    role: 'super_admin'
  }
};

const mockGame = {
  globalSettings: { siteAnnouncement: '', marqueeEnabled: false, doublePointsActive: false },
  gameState: { points: 100, tickets: 2 }
};

const mockDevice = {
  isMobile: false,
  deviceType: 'desktop'
};

try {
  console.log('🧪 正在模擬渲染 AdminDashboard...');
  const html = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuth },
      React.createElement(
        GameContext.Provider,
        { value: mockGame },
        React.createElement(
          DeviceContext.Provider,
          { value: mockDevice },
          React.createElement(AdminDashboard, { onClose: () => {} })
        )
      )
    )
  );
  console.log('✅ 伺服器端渲染成功，長度:', html.length);
} catch (err) {
  console.error('💥 渲染時捕獲致命錯誤:');
  console.error(err);
}
