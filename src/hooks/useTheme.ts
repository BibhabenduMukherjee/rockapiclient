import { useState, useEffect, useCallback } from 'react';

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    family: string;
    size: number;
  };
  layout: {
    sidebarWidth: number;
    borderRadius: number;
    spacing: number;
  };
}

export const defaultThemes: Theme[] = [
  {
    name: 'light',
    displayName: 'Light',
    colors: {
      primary: '#1890ff',
      secondary: '#722ed1',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#262626',
      textSecondary: '#8c8c8c',
      border: '#d9d9d9',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
      info: '#1890ff'
    },
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 14
    },
    layout: {
      sidebarWidth: 300,
      borderRadius: 6,
      spacing: 16
    }
  },
  {
    name: 'dark',
    displayName: 'Dark',
    colors: {
      primary: '#177ddc',
      secondary: '#642ab5',
      background: '#141414',
      surface: '#1f1f1f',
      text: '#ffffff',
      textSecondary: '#a6a6a6',
      border: '#434343',
      success: '#49aa19',
      warning: '#d89614',
      error: '#dc4446',
      info: '#177ddc'
    },
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 14
    },
    layout: {
      sidebarWidth: 300,
      borderRadius: 6,
      spacing: 16
    }
  },
  {
    name: 'high-contrast',
    displayName: 'High Contrast',
    colors: {
      primary: '#0000ff',
      secondary: '#800080',
      background: '#ffffff',
      surface: '#f0f0f0',
      text: '#000000',
      textSecondary: '#666666',
      border: '#000000',
      success: '#008000',
      warning: '#ff8c00',
      error: '#ff0000',
      info: '#0000ff'
    },
    fonts: {
      family: 'Arial, sans-serif',
      size: 16
    },
    layout: {
      sidebarWidth: 320,
      borderRadius: 0,
      spacing: 20
    }
  },
  {
    name: 'blue',
    displayName: 'Blue Ocean',
    colors: {
      primary: '#0066cc',
      secondary: '#004499',
      background: '#f0f8ff',
      surface: '#e6f3ff',
      text: '#003366',
      textSecondary: '#6699cc',
      border: '#b3d9ff',
      success: '#00aa44',
      warning: '#ff8800',
      error: '#cc0000',
      info: '#0066cc'
    },
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 14
    },
    layout: {
      sidebarWidth: 300,
      borderRadius: 8,
      spacing: 16
    }
  },
  // Mood-based themes
  {
    name: 'mood-happy',
    displayName: 'Sunshine ☀️',
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      background: '#fff8e1',
      surface: '#ffecb3',
      text: '#e65100',
      textSecondary: '#ff8f00',
      border: '#ffcc02',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#ff6b35'
    },
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 14
    },
    layout: {
      sidebarWidth: 300,
      borderRadius: 12,
      spacing: 16
    }
  },
  {
    name: 'mood-calm',
    displayName: 'Zen Garden 🌿',
    colors: {
      primary: '#4a6741',
      secondary: '#6b8e6b',
      background: '#f1f8e9',
      surface: '#e8f5e8',
      text: '#2e4a2e',
      textSecondary: '#5a7c5a',
      border: '#a5c99a',
      success: '#4caf50',
      warning: '#8bc34a',
      error: '#d32f2f',
      info: '#4a6741'
    },
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 14
    },
    layout: {
      sidebarWidth: 300,
      borderRadius: 10,
      spacing: 18
    }
  },
  {
    name: 'mood-creative',
    displayName: 'Purple Dreams 💜',
    colors: {
      primary: '#7b1fa2',
      secondary: '#9c27b0',
      background: '#fce4ec',
      surface: '#f8bbd9',
      text: '#4a148c',
      textSecondary: '#7b1fa2',
      border: '#ce93d8',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#e91e63',
      info: '#7b1fa2'
    },
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 14
    },
    layout: {
      sidebarWidth: 300,
      borderRadius: 14,
      spacing: 16
    }
  },
  {
    name: 'mood-focus',
    displayName: 'Deep Focus 🔥',
    colors: {
      primary: '#d32f2f',
      secondary: '#f57c00',
      background: '#fff3e0',
      surface: '#ffe0b2',
      text: '#bf360c',
      textSecondary: '#d84315',
      border: '#ffab91',
      success: '#388e3c',
      warning: '#f57c00',
      error: '#d32f2f',
      info: '#d32f2f'
    },
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: 14
    },
    layout: {
      sidebarWidth: 300,
      borderRadius: 8,
      spacing: 16
    }
  }
];

export interface ThemeSettings {
  currentTheme: string;
  customTheme?: Theme;
  fontSize: number;
  sidebarWidth: number;
  borderRadius: number;
  spacing: number;
}

const defaultSettings: ThemeSettings = {
  currentTheme: 'light', // Default to light theme
  fontSize: 14,
  sidebarWidth: 300,
  borderRadius: 6,
  spacing: 16
};

export function useTheme() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rock-api-theme-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('rock-api-theme-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save theme settings:', error);
      }
    }
  }, [settings, isLoaded]);

  // Apply theme to document
  useEffect(() => {
    if (!isLoaded) return;

    const currentTheme = defaultThemes.find(t => t.name === settings.currentTheme) || defaultThemes[0];
    const theme = settings.customTheme || currentTheme;

    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Apply font variables
    root.style.setProperty('--theme-font-family', theme.fonts.family);
    root.style.setProperty('--theme-font-size', `${settings.fontSize}px`);

    // Apply layout variables
    root.style.setProperty('--theme-sidebar-width', `${settings.sidebarWidth}px`);
    root.style.setProperty('--theme-border-radius', `${settings.borderRadius}px`);
    root.style.setProperty('--theme-spacing', `${settings.spacing}px`);

    // Apply theme class to body
    document.body.className = `theme-${settings.currentTheme}`;
  }, [settings, isLoaded]);

  const setTheme = useCallback((themeName: string) => {
    setSettings(prev => ({ ...prev, currentTheme: themeName }));
  }, []);

  const setCustomTheme = useCallback((customTheme: Theme) => {
    setSettings(prev => ({ ...prev, customTheme }));
  }, []);

  const updateSettings = useCallback((updates: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToDefault = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const getCurrentTheme = useCallback(() => {
    const currentTheme = defaultThemes.find(t => t.name === settings.currentTheme) || defaultThemes[0];
    return settings.customTheme || currentTheme;
  }, [settings]);

  return {
    settings,
    themes: defaultThemes,
    currentTheme: getCurrentTheme(),
    setTheme,
    setCustomTheme,
    updateSettings,
    resetToDefault,
    isLoaded
  };
}
