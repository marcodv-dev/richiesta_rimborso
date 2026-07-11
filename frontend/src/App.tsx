import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests';
import CreateRequest from './pages/CreateRequest';
import EditRequest from './pages/EditRequest';
import RequestDetail from './pages/RequestDetail';
import AllRequests from './pages/AllRequests';
import Statistics from './pages/Statistics';
import type { ReactNode } from 'react';
import './App.css';

const ProtectedRoute = ({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.Ruolo !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      {user && <Navbar />}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/mie-richieste" element={<ProtectedRoute requiredRole="dipendente"><MyRequests /></ProtectedRoute>} />
          <Route path="/mie-richieste/nuova" element={<ProtectedRoute requiredRole="dipendente"><CreateRequest /></ProtectedRoute>} />
          <Route path="/mie-richieste/:id/modifica" element={<ProtectedRoute requiredRole="dipendente"><EditRequest /></ProtectedRoute>} />
          <Route path="/mie-richieste/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />
          <Route path="/admin/richieste" element={<ProtectedRoute requiredRole="responsabile_amministrativo"><AllRequests /></ProtectedRoute>} />
          <Route path="/admin/richieste/:id" element={<ProtectedRoute requiredRole="responsabile_amministrativo"><RequestDetail /></ProtectedRoute>} />
          <Route path="/admin/statistiche" element={<ProtectedRoute requiredRole="responsabile_amministrativo"><Statistics /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
