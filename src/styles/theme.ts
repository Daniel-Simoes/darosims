export const theme = {
  colors: {
    primary: '#29b5e8',
    primaryDark: '#1a9fd4',
    secondary: '#808285',
    dark: '#1a1a2e',
    text: '#333333',
    textMuted: '#666666',
    textLight: '#999999',
    bg: '#ffffff',
    bgAlt: '#f7f9fc',
    bgDark: '#0f1419',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 30px rgba(0, 0, 0, 0.12)',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
  },
  navHeight: '72px',
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  breakpoints: {
    sm: '480px',
    md: '640px',
    tablet: '900px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type AppTheme = typeof theme;
