import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  { id: 'paper', name: '視覺暖紙格線', desc: '手帳格線・護眼米白 (會考讀書網專屬款)', icon: '📜', color: '#ef8354' }
];

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('paper');

  useEffect(() => {
    // 依使用者指示：視覺氛圍固定為「視覺暖紙格線」
    document.body.classList.remove('theme-sea', 'theme-sunset', 'theme-night');
    document.body.classList.add('theme-paper');
    localStorage.setItem('studyhub_theme', 'paper');
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme: 'paper', setCurrentTheme, THEMES }}>
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
