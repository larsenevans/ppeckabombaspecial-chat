'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeSettings {
  lightAccentHue: number;
  darkAccentHue: number;
  particlesEnabled: boolean;
}

interface ThemeContextType extends ThemeSettings {
  updateLightAccent: (hue: number) => void;
  updateDarkAccent: (hue: number) => void;
  toggleParticles: () => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  lightAccentHue: 200,
  darkAccentHue: 264,
  particlesEnabled: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      } catch (e) {
        console.error('[v0] Failed to parse theme settings:', e);
      }
    }
    setMounted(true);
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme-settings', JSON.stringify(settings));
      applyThemeVariables(settings);
    }
  }, [settings, mounted]);

  const updateLightAccent = (hue: number) => {
    setSettings((prev) => ({ ...prev, lightAccentHue: hue }));
  };

  const updateDarkAccent = (hue: number) => {
    setSettings((prev) => ({ ...prev, darkAccentHue: hue }));
  };

  const toggleParticles = () => {
    setSettings((prev) => ({
      ...prev,
      particlesEnabled: !prev.particlesEnabled,
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <ThemeContext.Provider
      value={{
        ...settings,
        updateLightAccent,
        updateDarkAccent,
        toggleParticles,
        resetToDefaults,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Apply CSS variables to document root
function applyThemeVariables(settings: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty('--accent-hue-light', `${settings.lightAccentHue}deg`);
  root.style.setProperty('--accent-hue-dark', `${settings.darkAccentHue}deg`);
}
