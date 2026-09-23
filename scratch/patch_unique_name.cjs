const fs = require('fs');

let content = fs.readFileSync('src/context/AuthContext.jsx', 'utf8');

// Update setCustomDisplayName
const oldFunc = `
  const setCustomDisplayName = (newName) => {
    if (!newName || !newName.trim()) return;
    let trimmed = newName.trim().slice(0, 20);
    // XSS 安全過濾：剔除潛在 HTML/Script 標籤符號
    trimmed = trimmed.replace(/[<>'"/\\\\\`]/g, '');
    if (!trimmed) return;

    // 仿冒防護：一般學生禁止使用管理員關鍵字
    const isAdminUser = checkIsAdmin(currentUser);
    if (!isAdminUser) {
      trimmed = trimmed.replace(/(管理員|總管理員|站長|官方|總管|系統總管|Admin|SuperAdmin)/gi, '同學');
    }
`;

const newFunc = `
  const setCustomDisplayName = (newName) => {
    if (!newName || !newName.trim()) return;
    let trimmed = newName.trim().slice(0, 20);
    // XSS 安全過濾：剔除潛在 HTML/Script 標籤符號
    trimmed = trimmed.replace(/[<>'"/\\\\\`]/g, '');
    if (!trimmed) return;

    // 仿冒防護：一般學生禁止使用管理員關鍵字
    const isAdminUser = checkIsAdmin(currentUser);
    if (!isAdminUser) {
      trimmed = trimmed.replace(/(管理員|總管理員|站長|官方|總管|系統總管|Admin|SuperAdmin)/gi, '同學');
    }

    // 防重複暱稱
    const registry = JSON.parse(localStorage.getItem('studyhub_user_registry') || '{}');
    const nameExists = Object.values(registry).some(u => 
      u.id !== currentUser?.id && 
      (u.name === trimmed || u.displayName === trimmed)
    );
    if (nameExists) {
       trimmed = trimmed + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
       alert('該暱稱已被使用，系統已自動為您加上專屬後綴：' + trimmed);
    }
`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/context/AuthContext.jsx', content);
