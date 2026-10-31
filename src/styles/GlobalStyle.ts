import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --color-primary: #29b5e8;
    --color-primary-dark: #1a9fd4;
    --color-secondary: #808285;
    --color-dark: #1a1a2e;
    --color-text: #333333;
    --color-text-muted: #666666;
    --color-text-light: #999999;
    --color-bg: #ffffff;
    --color-bg-alt: #f7f9fc;
    --color-bg-dark: #0f1419;
    --color-border: #e5e7eb;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-danger: #ef4444;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --nav-height: 72px;
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    overflow-x: clip;
  }

  body {
    font-family: var(--font-family);
    color: var(--color-text);
    background: var(--color-bg);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow-x: clip;
    min-width: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  body.draft-document-fullscreen .dash-sidebar,
  body.draft-document-fullscreen .dash-sidebar-backdrop {
    display: none !important;
  }

  body.draft-document-fullscreen .dashboard-main {
    margin-left: 0 !important;
  }

  body.draft-document-fullscreen .dashboard-layout {
    --sidebar-width: 0px;
  }
`;
