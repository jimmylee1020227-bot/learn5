import React, { useState } from 'react';

// ── 🎨 100% 本地內建高質感 SVG 頭像生成器 (零外網依賴，永不破圖) ──

// 經典飽和色階，用於姓名首字漸層
const GRADIENT_PALETTES = [
  ['#4f46e5', '#06b6d4'], // 靛藍-青綠
  ['#8b5cf6', '#ec4899'], // 紫羅蘭-粉紅
  ['#f97316', '#eab308'], // 鮮橙-琥珀
  ['#10b981', '#059669'], // 祖母綠
  ['#2563eb', '#3b82f6'], // 皇家藍
  ['#ef4444', '#f43f5e'], // 烈焰紅
  ['#6366f1', '#a855f7'], // 霓虹紫
  ['#14b8a6', '#06b6d4'], // 湖水綠
  ['#f59e0b', '#d97706'], // 暖金
  ['#0ea5e9', '#6366f1'], // 天空藍-靛
];

// 根據字串生成穩定的數字 Hash
function hashString(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// 取得姓名首字或代碼 (繁體字支援良好)
export function getAvatarInitials(name) {
  if (!name || typeof name !== 'string') return '學';
  const clean = name.trim().replace(/[\[\]【】()（）#\d]/g, '');
  if (!clean) return '學';
  // 如果是中文，取前 1~2 個字
  const firstChar = clean.charAt(0);
  return firstChar.toUpperCase();
}

// 生成純 SVG Data URI 姓名首字漸層頭像
export function generateInitialsAvatar(name = '同學', seed = '') {
  const char = getAvatarInitials(name);
  const hash = hashString(seed || name);
  const palette = GRADIENT_PALETTES[hash % GRADIENT_PALETTES.length];
  const [col1, col2] = palette;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="grad_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${col1}" />
        <stop offset="100%" stop-color="${col2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#grad_${hash})" />
    <text x="50" y="54" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang TC', 'Noto Sans TC', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">
      ${char}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ── 🌟 18 款精美內建向量 SVG Data URI 頭像 (動物、機器人、榮譽榜首) ──
function makeSvgAvatar(bgColor, innerSvg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <circle cx="60" cy="60" r="58" fill="${bgColor}" />
    ${innerSvg}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_AVATARS = [
  // 萌寵學伴系列
  {
    id: 'pet_shiba',
    category: '萌寵學伴',
    name: '柴犬同學',
    url: makeSvgAvatar('#ffe8d6', `
      <circle cx="60" cy="65" r="38" fill="#dd6b20" />
      <polygon points="30,30 45,55 25,55" fill="#c05621" />
      <polygon points="90,30 75,55 95,55" fill="#c05621" />
      <ellipse cx="60" cy="74" rx="22" ry="16" fill="#fffaf0" />
      <circle cx="48" cy="60" r="4.5" fill="#2d3748" />
      <circle cx="72" cy="60" r="4.5" fill="#2d3748" />
      <ellipse cx="60" cy="69" rx="6" ry="4" fill="#2d3748" />
      <circle cx="40" cy="68" r="4" fill="#feb2b2" opacity="0.7" />
      <circle cx="80" cy="68" r="4" fill="#feb2b2" opacity="0.7" />
    `)
  },
  {
    id: 'pet_cat',
    category: '萌寵學伴',
    name: '橘貓學長',
    url: makeSvgAvatar('#feebc8', `
      <circle cx="60" cy="66" r="36" fill="#ed8936" />
      <polygon points="32,32 46,54 26,52" fill="#c05621" />
      <polygon points="88,32 74,54 94,52" fill="#c05621" />
      <ellipse cx="48" cy="64" rx="4" ry="5.5" fill="#2d3748" />
      <ellipse cx="72" cy="64" rx="4" ry="5.5" fill="#2d3748" />
      <polygon points="60,70 56,74 64,74" fill="#f687b3" />
      <path d="M54,77 Q60,82 66,77" stroke="#2d3748" stroke-width="2" fill="none" />
      <line x1="28" y1="67" x2="42" y2="69" stroke="#718096" stroke-width="2" />
      <line x1="92" y1="67" x2="78" y2="69" stroke="#718096" stroke-width="2" />
    `)
  },
  {
    id: 'pet_panda',
    category: '萌寵學伴',
    name: '功夫熊貓',
    url: makeSvgAvatar('#e2e8f0', `
      <circle cx="60" cy="66" r="38" fill="#ffffff" stroke="#cbd5e0" stroke-width="2" />
      <circle cx="34" cy="38" r="14" fill="#1a202c" />
      <circle cx="86" cy="38" r="14" fill="#1a202c" />
      <ellipse cx="46" cy="62" rx="9" ry="12" fill="#1a202c" transform="rotate(-15 46 62)" />
      <ellipse cx="74" cy="62" rx="9" ry="12" fill="#1a202c" transform="rotate(15 74 62)" />
      <circle cx="47" cy="60" r="3.5" fill="#ffffff" />
      <circle cx="73" cy="60" r="3.5" fill="#ffffff" />
      <ellipse cx="60" cy="74" rx="7" ry="5" fill="#1a202c" />
    `)
  },
  {
    id: 'pet_owl',
    category: '萌寵學伴',
    name: '智慧貓頭鷹',
    url: makeSvgAvatar('#e9d8fd', `
      <circle cx="60" cy="66" r="38" fill="#6b46c1" />
      <polygon points="36,36 48,50 30,50" fill="#553c9a" />
      <polygon points="84,36 72,50 90,50" fill="#553c9a" />
      <circle cx="46" cy="62" r="12" fill="#ffffff" />
      <circle cx="74" cy="62" r="12" fill="#ffffff" />
      <circle cx="46" cy="62" r="6" fill="#1a202c" />
      <circle cx="74" cy="62" r="6" fill="#1a202c" />
      <polygon points="60,68 54,76 66,76" fill="#ecc94b" />
      <rect x="36" y="58" width="48" height="3" fill="#2d3748" rx="1.5" />
    `)
  },
  {
    id: 'pet_penguin',
    category: '萌寵學伴',
    name: '博士企鵝',
    url: makeSvgAvatar('#bee3f8', `
      <circle cx="60" cy="66" r="38" fill="#2b6cb0" />
      <ellipse cx="60" cy="72" rx="24" ry="26" fill="#ffffff" />
      <circle cx="48" cy="60" r="4" fill="#1a202c" />
      <circle cx="72" cy="60" r="4" fill="#1a202c" />
      <polygon points="60,66 53,74 67,74" fill="#dd6b20" />
      <polygon points="60,26 40,36 80,36" fill="#1a202c" />
      <rect x="52" y="34" width="16" height="5" fill="#e53e3e" />
    `)
  },
  {
    id: 'pet_fox',
    category: '萌寵學伴',
    name: '靈巧赤狐',
    url: makeSvgAvatar('#fed7d7', `
      <circle cx="60" cy="66" r="38" fill="#e53e3e" />
      <polygon points="32,28 48,50 26,48" fill="#ffffff" />
      <polygon points="88,28 72,50 94,48" fill="#ffffff" />
      <polygon points="36,32 46,48 30,46" fill="#c53030" />
      <polygon points="84,32 74,48 90,46" fill="#c53030" />
      <path d="M42,68 Q60,94 78,68 Z" fill="#ffffff" />
      <circle cx="48" cy="62" r="4" fill="#1a202c" />
      <circle cx="72" cy="62" r="4" fill="#1a202c" />
      <circle cx="60" cy="78" r="4.5" fill="#1a202c" />
    `)
  },

  // 賽博機器人系列
  {
    id: 'bot_blue',
    category: 'AI 機器人',
    name: '運算藍俠',
    url: makeSvgAvatar('#ebf8ff', `
      <rect x="34" y="38" width="52" height="46" rx="10" fill="#3182ce" />
      <line x1="60" y1="24" x2="60" y2="38" stroke="#3182ce" stroke-width="4" />
      <circle cx="60" cy="22" r="5" fill="#63b3ed" />
      <rect x="42" y="48" width="36" height="14" rx="4" fill="#1a202c" />
      <circle cx="50" cy="55" r="3" fill="#63b3ed" />
      <circle cx="70" cy="55" r="3" fill="#63b3ed" />
      <line x1="46" y1="72" x2="74" y2="72" stroke="#ebf8ff" stroke-width="3" stroke-linecap="round" />
    `)
  },
  {
    id: 'bot_gold',
    category: 'AI 機器人',
    name: '金色冠軍',
    url: makeSvgAvatar('#fefcbf', `
      <rect x="34" y="38" width="52" height="46" rx="10" fill="#d69e2e" />
      <polygon points="60,20 64,28 72,28 66,34 68,42 60,37 52,42 54,34 48,28 56,28" fill="#ecc94b" />
      <rect x="42" y="48" width="36" height="14" rx="4" fill="#744210" />
      <circle cx="50" cy="55" r="3.5" fill="#faf089" />
      <circle cx="70" cy="55" r="3.5" fill="#faf089" />
      <line x1="48" y1="72" x2="72" y2="72" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
    `)
  },
  {
    id: 'bot_green',
    category: 'AI 機器人',
    name: '自然綠影',
    url: makeSvgAvatar('#c6f6d5', `
      <rect x="34" y="38" width="52" height="46" rx="10" fill="#38a169" />
      <circle cx="60" cy="24" r="6" fill="#48bb78" />
      <line x1="60" y1="30" x2="60" y2="38" stroke="#38a169" stroke-width="4" />
      <rect x="42" y="48" width="36" height="14" rx="4" fill="#1c4532" />
      <circle cx="50" cy="55" r="3" fill="#9ae6b4" />
      <circle cx="70" cy="55" r="3" fill="#9ae6b4" />
      <path d="M48,72 Q60,78 72,72" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" />
    `)
  },
  {
    id: 'bot_purple',
    category: 'AI 機器人',
    name: '量子紫光',
    url: makeSvgAvatar('#faf5ff', `
      <rect x="34" y="38" width="52" height="46" rx="10" fill="#805ad5" />
      <polygon points="60,20 54,38 66,38" fill="#b794f4" />
      <rect x="42" y="48" width="36" height="14" rx="4" fill="#2d1a4c" />
      <circle cx="50" cy="55" r="3.5" fill="#d6bcfa" />
      <circle cx="70" cy="55" r="3.5" fill="#d6bcfa" />
      <line x1="46" y1="72" x2="74" y2="72" stroke="#faf5ff" stroke-width="3" stroke-linecap="round" />
    `)
  },
  {
    id: 'bot_fire',
    category: 'AI 機器人',
    name: '烈焰戰魂',
    url: makeSvgAvatar('#fff5f5', `
      <rect x="34" y="38" width="52" height="46" rx="10" fill="#e53e3e" />
      <path d="M60,18 Q66,28 60,38 Q54,28 60,18 Z" fill="#dd6b20" />
      <rect x="42" y="48" width="36" height="14" rx="4" fill="#742a2a" />
      <circle cx="50" cy="55" r="3.5" fill="#feb2b2" />
      <circle cx="70" cy="55" r="3.5" fill="#feb2b2" />
      <path d="M48,72 Q60,76 72,72" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" />
    `)
  },
  {
    id: 'bot_silver',
    category: 'AI 機器人',
    name: '未來銀翼',
    url: makeSvgAvatar('#edf2f7', `
      <rect x="34" y="38" width="52" height="46" rx="10" fill="#4a5568" />
      <circle cx="60" cy="22" r="5" fill="#a0aec0" />
      <line x1="60" y1="27" x2="60" y2="38" stroke="#4a5568" stroke-width="4" />
      <rect x="42" y="48" width="36" height="14" rx="4" fill="#1a202c" />
      <circle cx="50" cy="55" r="3.5" fill="#63b3ed" />
      <circle cx="70" cy="55" r="3.5" fill="#63b3ed" />
      <line x1="46" y1="72" x2="74" y2="72" stroke="#cbd5e0" stroke-width="3" stroke-linecap="round" />
    `)
  },

  // 狀元學霸系列
  {
    id: 'stu_boy1',
    category: '狀元學霸',
    name: '數學資優生',
    url: makeSvgAvatar('#ebf8ff', `
      <circle cx="60" cy="65" r="32" fill="#fbd38d" />
      <path d="M30,55 Q60,20 90,55 Q60,35 30,55 Z" fill="#2b6cb0" />
      <circle cx="48" cy="62" r="3.5" fill="#1a202c" />
      <circle cx="72" cy="62" r="3.5" fill="#1a202c" />
      <circle cx="48" cy="62" r="8" stroke="#3182ce" stroke-width="2" fill="none" />
      <circle cx="72" cy="62" r="8" stroke="#3182ce" stroke-width="2" fill="none" />
      <line x1="56" y1="62" x2="64" y2="62" stroke="#3182ce" stroke-width="2" />
      <path d="M52,78 Q60,84 68,78" stroke="#c05621" stroke-width="2" fill="none" stroke-linecap="round" />
    `)
  },
  {
    id: 'stu_girl1',
    category: '狀元學霸',
    name: '英文榜首',
    url: makeSvgAvatar('#fff5f5', `
      <circle cx="60" cy="65" r="32" fill="#feebc8" />
      <path d="M26,50 Q60,18 94,50 Q98,80 84,90 Q60,40 36,90 Q22,80 26,50 Z" fill="#9b2c2c" />
      <circle cx="48" cy="62" r="3.5" fill="#1a202c" />
      <circle cx="72" cy="62" r="3.5" fill="#1a202c" />
      <circle cx="40" cy="68" r="4" fill="#feb2b2" opacity="0.6" />
      <circle cx="80" cy="68" r="4" fill="#feb2b2" opacity="0.6" />
      <path d="M52,76 Q60,82 68,76" stroke="#c05621" stroke-width="2" fill="none" stroke-linecap="round" />
    `)
  },
  {
    id: 'stu_boy2',
    category: '狀元學霸',
    name: '理化實驗家',
    url: makeSvgAvatar('#e6fffa', `
      <circle cx="60" cy="65" r="32" fill="#fbd38d" />
      <path d="M30,52 Q60,22 90,52 Q60,38 30,52 Z" fill="#234e52" />
      <circle cx="48" cy="62" r="3.5" fill="#1a202c" />
      <circle cx="72" cy="62" r="3.5" fill="#1a202c" />
      <path d="M52,78 Q60,84 68,78" stroke="#c05621" stroke-width="2" fill="none" stroke-linecap="round" />
      <rect x="52" y="32" width="16" height="6" fill="#319795" rx="2" />
    `)
  },
  {
    id: 'stu_girl2',
    category: '狀元學霸',
    name: '國文才女',
    url: makeSvgAvatar('#faf5ff', `
      <circle cx="60" cy="65" r="32" fill="#feebc8" />
      <path d="M26,52 Q60,18 94,52 Q94,75 88,88 Q60,40 32,88 Q26,75 26,52 Z" fill="#44337a" />
      <circle cx="48" cy="62" r="3.5" fill="#1a202c" />
      <circle cx="72" cy="62" r="3.5" fill="#1a202c" />
      <circle cx="40" cy="68" r="4" fill="#e9d8fd" />
      <circle cx="80" cy="68" r="4" fill="#e9d8fd" />
      <path d="M52,76 Q60,82 68,76" stroke="#c05621" stroke-width="2" fill="none" stroke-linecap="round" />
    `)
  },
  {
    id: 'stu_glasses',
    category: '狀元學霸',
    name: '全科榜眼',
    url: makeSvgAvatar('#edf2f7', `
      <circle cx="60" cy="65" r="32" fill="#fbd38d" />
      <path d="M30,55 Q60,20 90,55 Q60,35 30,55 Z" fill="#1a202c" />
      <rect x="40" y="55" width="16" height="14" rx="3" stroke="#4a5568" stroke-width="2.5" fill="none" />
      <rect x="64" y="55" width="16" height="14" rx="3" stroke="#4a5568" stroke-width="2.5" fill="none" />
      <line x1="56" y1="62" x2="64" y2="62" stroke="#4a5568" stroke-width="2" />
      <circle cx="48" cy="62" r="2.5" fill="#1a202c" />
      <circle cx="72" cy="62" r="2.5" fill="#1a202c" />
      <path d="M52,78 Q60,84 68,78" stroke="#c05621" stroke-width="2" fill="none" stroke-linecap="round" />
    `)
  },
  {
    id: 'stu_winner',
    category: '狀元學霸',
    name: '滿分狀元',
    url: makeSvgAvatar('#fffaf0', `
      <circle cx="60" cy="66" r="32" fill="#fbd38d" />
      <path d="M28,52 Q60,22 92,52 Q60,36 28,52 Z" fill="#744210" />
      <polygon points="60,18 64,28 74,28 66,34 69,44 60,38 51,44 54,34 46,28 56,28" fill="#d69e2e" stroke="#b7791f" stroke-width="1.5" />
      <circle cx="48" cy="63" r="3.5" fill="#1a202c" />
      <circle cx="72" cy="63" r="3.5" fill="#1a202c" />
      <path d="M52,78 Q60,86 68,78" stroke="#c05621" stroke-width="2.5" fill="none" stroke-linecap="round" />
    `)
  }
];

// ── 🛡️ 智慧圖片容錯渲染組件 (AvatarImage) ──
export function AvatarImage({ 
  src, 
  alt = '用戶頭像', 
  name = '同學', 
  seed = '', 
  className = '', 
  style = {},
  size = 40,
  onClick
}) {
  const [hasError, setHasError] = useState(false);

  // 判斷給予的 src 是否能直接使用
  let effectiveSrc = src;
  if (!effectiveSrc || effectiveSrc.trim() === '' || hasError) {
    effectiveSrc = generateInitialsAvatar(name, seed || name);
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'inline-block',
        verticalAlign: 'middle',
        background: '#e2e8f0',
        flexShrink: 0,
        ...style
      }}
      loading="lazy"
    />
  );
}
