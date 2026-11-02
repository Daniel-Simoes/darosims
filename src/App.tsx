import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DarosEntryLoading } from './components/DarosEntryLoading';
import { HomePage } from './pages/HomePage';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { HandheldWebGate } from './features/dashboard/components/DashboardDesktopOnly';
import { MarketingSubPage } from './pages/marketing/MarketingSubPage';

function AppShell() {
  const { isEntryLoading } = useAuth();

  return (
    <>
      {isEntryLoading ? <DarosEntryLoading /> : null}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/signin"
          element={
            <HandheldWebGate>
              <SignInPage />
            </HandheldWebGate>
          }
        />
        <Route path="/:category/:slug" element={<MarketingSubPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HandheldWebGate>
                <DashboardPage />
              </HandheldWebGate>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
