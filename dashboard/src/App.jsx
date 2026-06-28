import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { LoadingState } from './components/LoadingState';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { EmergencyDetailPage } from './pages/EmergencyDetailPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <LoadingState message="Checking session" />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route element={<DashboardHomePage />} path="/dashboard" />
        <Route element={<EmergencyDetailPage />} path="/emergencies/:emergencyId" />
      </Route>
      <Route element={<Navigate replace to="/dashboard" />} path="*" />
    </Routes>
  );
}

export default App;
