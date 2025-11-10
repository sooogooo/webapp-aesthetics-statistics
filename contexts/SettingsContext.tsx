import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Settings, Theme, FontSize, AiStyle, AiLength } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const themeColors: Record<Theme, Record<string, string>> = {
  mint: { '--color-primary': '64 192 182' },
  lavender: { '--color-primary': '163 142 209' },
  rose: { '--color-primary': '229 140 157' },
  peach: { '--color-primary': '242 169 144' },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<Settings>('app-settings', {
    theme: 'mint',
    fontSize: 'font-size-md',
    aiStyle: '标准日常',
    aiLength: '简约',
  });

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    Object.entries(themeColors[settings.theme]).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Apply font size
    document.body.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.body.classList.add(settings.fontSize);

  }, [settings]);

  const value = useMemo(() => ({ settings, setSettings }), [settings, setSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
