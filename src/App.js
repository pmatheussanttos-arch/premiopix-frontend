import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Mestre from './pages/Mestre';
import MestreComprar from './pages/MestreComprar';
import Ranking from './pages/Ranking';
import Perfil from './pages/Perfil';
import { PlacarPremiado } from './pages/PlacarPremiado';
import PlacarDetalhe from './pages/PlacarDetalhe';
import { MeusJogos, Ganhadores } from './pages/MeusJogosGanhadores';
import { Login, Register } from './pages/LoginRegister';
import Admin from './pages/Admin';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  return user?.is_admin ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                       element={<Home />} />
        <Route path="/mestre"                 element={<Mestre />} />
        <Route path="/mestre/comprar/:id"     element={<PrivateRoute><MestreComprar /></PrivateRoute>} />
        <Route path="/ranking"                element={<Ranking />} />
        <Route path="/perfil"                 element={<PrivateRoute><Perfil /></PrivateRoute>} />
        <Route path="/ganhadores"             element={<Ganhadores />} />
        <Route path="/meus-jogos"             element={<PrivateRoute><MeusJogos /></PrivateRoute>} />
        <Route path="/placar-premiado"        element={<PlacarPremiado />} />
        <Route path="/placar/:id"             element={<PrivateRoute><PlacarDetalhe /></PrivateRoute>} />
        <Route path="/login"                  element={<Login />} />
        <Route path="/register"              element={<Register />} />
        <Route path="/admin"                  element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*"                       element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
