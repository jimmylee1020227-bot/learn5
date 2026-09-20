import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  { id: 'paper', name: '暖陽杏白 (經典)', desc: '溫暖米白與珊瑚橘', icon: '📜', color: '#ef8354' },
  { id: 'matcha', name: '抹茶薄荷 (清新)', desc: '薄荷綠與青草綠', icon: '🍵', color: '#6ba354' },
  { id: 'soda', name: '海鹽蘇打 (冷靜)', desc: '冰雪藍與蔚藍色', icon: '🧊', color: '#3a86ff' },
  { id: 'sakura', name: '櫻花奶蓋 (溫柔)', desc: '櫻花粉與玫瑰紅', icon: '🌸', color: '#e05263' },
  { id: 'lavender', name: '薰衣草紫 (夢幻)', desc: '淡紫與亮紫色', icon: '🔮', color: '#8b5cf6' },
  { id: 'lemon', name: '檸檬海綿 (活力)', desc: '檸檬黃與亮金黃', icon: '🍋', color: '#eab308' },
  { id: 'oat', name: '燕麥拿鐵 (復古)', desc: '奶茶色與焦糖色', icon: '☕', color: '#c27a3e' },
  { id: 'glacier', name: '冰川銀灰 (極簡)', desc: '冷灰色與石板藍', icon: '🌫️', color: '#64748b' }
];

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('paper');

  useEffect(() => {
    const saved = localStorage.getItem('studyhub_theme') || 'paper';
    setCurrentTheme(saved);
  }, []);

  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
    localStorage.setItem('studyhub_theme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      currentTheme: 'paper',
      setCurrentTheme: () => {},
      THEMES
    };
  }
  return context;
}
