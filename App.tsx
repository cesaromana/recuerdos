import React from 'react';
// FIX: Use named imports for react-router-dom to fix resolution errors.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreateMemoryPage from './pages/CreateMemoryPage';
import ViewMemoryPage from './pages/ViewMemoryPage';
import EditMemoryPage from './pages/EditMemoryPage';
import MapPage from './pages/MapPage';
import SearchPage from './pages/SearchPage';
import SummaryPage from './pages/SummaryPage';
import Header from './components/Header';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Main />
      </HashRouter>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isAuthenticated && <Header />}
      <main className="p-4 sm:p-6 md:p-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={<ProtectedRoute><HomePage /></ProtectedRoute>}
          />
          <Route
            path="/crear"
            element={<ProtectedRoute><CreateMemoryPage /></ProtectedRoute>}
          />
          <Route
            path="/recuerdo/:date"
            element={<ProtectedRoute><ViewMemoryPage /></ProtectedRoute>}
          />
          <Route
            path="/editar/:date"
            element={<ProtectedRoute><EditMemoryPage /></ProtectedRoute>}
          />
           <Route
            path="/mapa"
            element={<ProtectedRoute><MapPage /></ProtectedRoute>}
          />
          <Route
            path="/search"
            element={<ProtectedRoute><SearchPage /></ProtectedRoute>}
          />
          <Route
            path="/resumen"
            element={<ProtectedRoute><SummaryPage /></ProtectedRoute>}
          />
           <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};


export default App;