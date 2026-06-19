import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Cek apakah sebelumnya ada tema yang tersimpan di memori lokal, jika tidak gunakan 'modern'
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'modern');

  useEffect(() => {
    // Menyimpan tema ke localStorage agar tidak hilang saat aplikasi direstart
    localStorage.setItem('app-theme', theme);
    
    // Memasang atribut 'data-theme' ke tag HTML utama
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};