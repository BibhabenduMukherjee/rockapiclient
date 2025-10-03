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
      primary: '#1890ff',
      secondary: '#722ed1',
      background: '#1a1a1a',
      surface: '#262626',
      text: '#ffffff',
      textSecondary: '#bfbfbf',
      border: '#434343',
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
    name: 'mood-ocean',
    displayName: 'Ocean Breeze 🌊',
    colors: {
      primary: '#0077be',
      secondary: '#00a8cc',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#7dd3fc',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0077be'
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
    name: 'mood-lavender',
    displayName: 'Lavender Fields 💜',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#581c87',
      textSecondary: '#7c3aed',
      border: '#c4b5fd',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#8b5cf6'
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
    name: 'mood-sunset',
    displayName: 'Sunset Glow 🌅',
    colors: {
      primary: '#f59e0b',
      secondary: '#ea580c',
      background: '#fffbeb',
      surface: '#fef3c7',
      text: '#92400e',
      textSecondary: '#d97706',
      border: '#fbbf24',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#f59e0b'
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
