'use client';

import { useState } from 'react';
import { Moon, Sun, Palette, RotateCcw, Sparkles, X } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { hueToHex, hexToHue } from '@/lib/color-utils';
import { useTheme as useNextTheme } from 'next-themes';

export function ThemeSettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useNextTheme();
  const {
    lightAccentHue,
    darkAccentHue,
    particlesEnabled,
    updateLightAccent,
    updateDarkAccent,
    toggleParticles,
    resetToDefaults,
  } = useTheme();

  const currentTheme = theme === 'dark' ? 'dark' : 'light';
  const currentAccentHue = currentTheme === 'dark' ? darkAccentHue : lightAccentHue;
  const currentHexColor = hueToHex(currentAccentHue);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hue = hexToHue(e.target.value);
    if (currentTheme === 'dark') {
      updateDarkAccent(hue);
    } else {
      updateLightAccent(hue);
    }
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hue = parseInt(e.target.value, 10);
    if (currentTheme === 'dark') {
      updateDarkAccent(hue);
    } else {
      updateLightAccent(hue);
    }
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-40 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-background/95 transition-all duration-200 text-foreground"
        aria-label="Open theme settings"
        title="Theme Settings"
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full sm:w-96 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Theme Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-accent/10 rounded-lg transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                Theme
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    currentTheme === 'light'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    currentTheme === 'dark'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                Accent Color ({currentTheme} theme)
              </label>
              <div className="flex gap-2">
                {/* Color Picker Input */}
                <input
                  type="color"
                  value={currentHexColor}
                  onChange={handleColorChange}
                  className="w-16 h-10 rounded-lg cursor-pointer border border-border"
                />
                {/* Hue Slider */}
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={currentAccentHue}
                  onChange={handleHueChange}
                  className="flex-1 h-10 rounded-lg cursor-pointer accent-[var(--accent-hue-dynamic)]"
                />
              </div>
              {/* Hue Value Display */}
              <div className="text-xs text-muted-foreground">
                Hue: {currentAccentHue}°
              </div>
            </div>

            {/* Particles Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                Particle Animation
              </label>
              <button
                onClick={toggleParticles}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  particlesEnabled
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {particlesEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                resetToDefaults();
                setTheme('dark');
              }}
              className="w-full py-2 px-4 rounded-lg font-medium bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </>
  );
}
