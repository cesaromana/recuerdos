import React from 'react';
// FIX: Use named imports for react-router-dom to fix resolution errors.
// FIX: Changed to namespace import to fix module resolution errors.
// FIX: Reverted to named imports to resolve component properties.
import * as ReactRouterDOM from 'react-router-dom';
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
    // FIX: Replaced ReactRouterDOM.Navigate with Navigate from named import.
    return <ReactRouterDOM.Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      {/* FIX: Replaced ReactRouterDOM.HashRouter with HashRouter from named import. */}
      <ReactRouterDOM.HashRouter>
        <Main />
      </ReactRouterDOM.HashRouter>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isAuthenticated && <Header />}
      <main className="p-4 sm:p-6 md:p-8">
        {/* FIX: Replaced ReactRouterDOM.Routes with Routes from named import. */}
        <ReactRouterDOM.Routes>
          {/* FIX: Replaced ReactRouterDOM.Route with Route from named import. */}
          <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
          {/* FIX: Replaced ReactRouterDOM.Route with Route from named import. */}
          <ReactRouterDOM.Route
            path="/"
            element={<ProtectedRoute><HomePage /></ProtectedRoute>}
          />
          {/* FIX: Replaced ReactRouterDOM.Route with Route from named import. */}
          <ReactRouterDOM.Route
            path="/crear"
            element={<ProtectedRoute><CreateMemoryPage /></ProtectedRoute>}
          />
          {/* FIX: Replaced ReactRouterDOM.Route with Route from named import. */}
          <ReactRouterDOM.Route
            path="/recuerdo/:date"
            element={<ProtectedRoute><ViewMemoryPage /></ProtectedRoute>}
          />
          {/* FIX: Replaced ReactRouterDOM.Route with Route from named import. */}
          <ReactRouterDOM.Route
            path="/editar/:date"
            element={<ProtectedRoute><EditMemoryPage /></ProtectedRoute>}
          />
           {/* FIX: Replaced ReactRouterDOM.Route with Route from named import. */}
           <ReactRouterDOM.Route
            path="/mapa"
            element={<ProtectedRoute><MapPage /></ProtectedRoute>}
          />
          {/* FIX: Replaced ReactRouterDOM.Route with Route from named import. */}
          <ReactRouterDOM.Route
            path="/search"
            element={<ProtectedRoute><SearchPage /></ProtectedRoute>}
          />
          {/* FIX: Replaced ReactRouterDOM.Route with Route from named import. */}
          <ReactRouterDOM.Route
            path="/resumen"
            element={<ProtectedRoute><SummaryPage /></ProtectedRoute>}
          />
           {/* FIX: Replaced ReactRouterDOM.Route with Route and ReactRouterDOM.Navigate with Navigate from named imports. */}
           <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" />} />
        </ReactRouterDOM.Routes>
      </main>
    </div>
  );
};


export default App;