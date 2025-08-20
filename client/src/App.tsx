import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Stores from './pages/Stores';
import OwnerDashboard from './pages/OwnerDashboard';
import Profile from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';

const Nav: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <nav style={{display:'flex', gap:12, padding:12, borderBottom:'1px solid #ddd'}}>
      <Link to="/">Stores</Link>
      {user?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
      {user?.role === 'OWNER' && <Link to="/owner">Owner</Link>}
      {user ? (
        <>
          <Link to="/profile">Profile</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Stores /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/owner" element={<ProtectedRoute roles={['OWNER','ADMIN']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
