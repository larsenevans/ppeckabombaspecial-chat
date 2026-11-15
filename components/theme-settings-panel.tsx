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
        className="fixed right-20 top-4 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent/10"
        aria-label="Open theme settings"
        title="Theme Settings"
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-label="Close theme settings"
          />

          {/* Panel */}
          <div
            className="relative max-h-[90dvh] w-full space-y-6 overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl sm:w-96 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-settings-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 id="theme-settings-title" className="text-lg font-semibold text-foreground">Theme Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
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
                  aria-pressed={currentTheme === 'light'}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors ${
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
                  aria-pressed={currentTheme === 'dark'}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors ${
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
                  className="h-11 w-16 cursor-pointer rounded-lg border border-border"
                />
                {/* Hue Slider */}
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={currentAccentHue}
                  onChange={handleHueChange}
                  className="h-11 min-w-0 flex-1 cursor-pointer accent-[var(--accent-hue-dynamic)]"
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
                className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
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
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary/50 px-4 py-2 font-medium text-secondary-foreground transition-colors hover:bg-secondary"
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
