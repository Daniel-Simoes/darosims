import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import App from './App.tsx';
import { GlobalStyle } from './styles/GlobalStyle';
import { LegacyGlobalClasses } from './styles/globalStyled';
import { theme } from './styles/theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <LegacyGlobalClasses />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
