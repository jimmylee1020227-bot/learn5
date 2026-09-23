import crypto from 'crypto';

export function generateDeterministicUserId(email) {
  // 簡易且穩定的雜湊方式，確保同一信箱永遠對應同一 ID (避免不同裝置登入被視為新帳號)
  const str = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'user_' + Math.abs(hash).toString(36);
}
console.log(generateDeterministicUserId("test@gmail.com"));
