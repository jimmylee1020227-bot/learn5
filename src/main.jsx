import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 全域安全防護：攔截 localStorage.setItem 避免 5MB 空間滿載時拋出 QuotaExceededError
// 防止因為本地空間滿而導致後續的 Firebase 雲端同步被中斷 (莫名消失)
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  try {
    originalSetItem.apply(this, [key, value]);
  } catch (e) {
    console.warn(`[LocalStorage 空間警報] 無法寫入 key: ${key}，本地 5MB 空間可能已滿！資料將降級為僅記憶體與雲端同步，請考慮清除快取。`, e);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
