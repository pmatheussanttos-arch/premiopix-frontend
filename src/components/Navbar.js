import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    path === '/mestre'
      ? location.pathname === '/mestre' || location.pathname.startsWith('/mestre/')
      : location.pathname === path;

  const linkStyle = (path) => ({
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    color: isActive(path) ? '#FFB800' : 'rgba(255,255,255,0.7)',
    borderBottom: isActive(path) ? '2px solid #FFB800' : '2px solid transparent',
    paddingBottom: 2,
    transition: 'color 0.2s',
  });

  return (
    <nav style={{
      background: '#0D1B2A',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 24px rgba(0,0,0,0.4)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🏆</span>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 1.5, color: 'white', lineHeight: 1 }}>
            Mestre do <span style={{ color: '#FFB800' }}>Placar</span>
          </span>
        </Link>

        {/* Links centrais */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link to="/mestre" style={linkStyle('/mestre')}>⚽ Rodadas</Link>
          <Link to="/ranking" style={linkStyle('/ranking')}>📊 Ranking</Link>
          <Link to="/ganhadores" style={linkStyle('/ganhadores')}>🏆 Ganhadores</Link>
          {user && <Link to="/perfil" style={linkStyle('/perfil')}>👤 Perfil</Link>}
          {user?.is_admin && (
            <Link to="/admin" style={{ ...linkStyle('/admin'), color: isActive('/admin') ? '#00C16A' : 'rgba(0,193,106,0.7)', borderBottomColor: isActive('/admin') ? '#00C16A' : 'transparent' }}>
              ⚙ Admin
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                Olá, {user.nome.split(' ')[0]} 👋
              </span>
              <button
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.8)', borderRadius: 8, fontSize: 13, padding: '6px 14px',
                  cursor: 'pointer', fontWeight: 500,
                }}
                onClick={() => { logout(); navigate('/'); }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.8)', borderRadius: 8, fontSize: 13, padding: '6px 14px',
                  cursor: 'pointer', fontWeight: 500,
                }}>
                  Entrar
                </button>
              </Link>
              <Link to="/register">
                <button style={{
                  background: '#00C16A', border: 'none', color: 'white',
                  borderRadius: 8, fontSize: 13, padding: '6px 16px',
                  cursor: 'pointer', fontWeight: 700,
                  boxShadow: '0 2px 12px rgba(0,193,106,0.4)',
                }}>
                  Cadastrar grátis
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
