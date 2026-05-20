import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    color: isActive(path) ? '#00C16A' : '#555',
    borderBottom: isActive(path) ? '2px solid #00C16A' : '2px solid transparent',
    paddingBottom: 2,
    transition: 'color 0.2s',
  });

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #eee',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 28 }}>⚽</span>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 1, color: '#111' }}>
            Prêmio<span style={{ color: '#00C16A' }}>PIX</span>
          </span>
        </Link>

        {/* Links centrais */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/placar-premiado" style={linkStyle('/placar-premiado')}>🎯 Placar Premiado</Link>
          <Link to="/ganhadores" style={linkStyle('/ganhadores')}>🏆 Ganhadores</Link>
          {user && <Link to="/meus-jogos" style={linkStyle('/meus-jogos')}>📋 Meus Jogos</Link>}
          {user?.is_admin && <Link to="/admin" style={{ ...linkStyle('/admin'), color: '#7c3aed' }}>⚙ Admin</Link>}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                Olá, {user.nome.split(' ')[0]} 👋
              </span>
              <button
                className="btn btn-outline"
                style={{ fontSize: 13, padding: '6px 14px' }}
                onClick={() => { logout(); navigate('/'); }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn btn-outline" style={{ fontSize: 13, padding: '6px 14px' }}>Entrar</button>
              </Link>
              <Link to="/register">
                <button className="btn btn-primary" style={{ fontSize: 13, padding: '6px 14px', background: '#00C16A', border: 'none' }}>
                  Cadastrar
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
