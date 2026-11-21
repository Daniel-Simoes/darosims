import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SkeletonTheme } from 'react-loading-skeleton';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DarosEntryLoading } from './components/DarosEntryLoading';
import { HomePage } from './pages/HomePage';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { HandheldWebGate } from './features/dashboard/components/DashboardDesktopOnly';
import { MarketingSubPage } from './pages/marketing/MarketingSubPage';
import { LegalDocumentPage } from './pages/legal/LegalDocumentPage';
import { LgpdRequestPage } from './pages/legal/LgpdRequestPage';
function AppShell() {
  const { isEntryLoading } = useAuth();

  return (
    <>
      {isEntryLoading ? <DarosEntryLoading /> : null}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/legal/data-request" element={<LgpdRequestPage />} />
        <Route path="/legal/lgpd" element={<Navigate to="/legal/data-request" replace />} />
        <Route path="/legal/:slug" element={<LegalDocumentPage />} />
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
      <SkeletonTheme baseColor="#e8edf3" highlightColor="#f8fafc" borderRadius={8} duration={1.2}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </SkeletonTheme>
    </AuthProvider>
  );
}

export default App;
