import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const mobileLinkStyle = (path) => ({
    textDecoration: 'none',
    fontSize: 16,
    fontWeight: 600,
    color: isActive(path) ? '#FFB800' : 'rgba(255,255,255,0.85)',
    display: 'block',
    padding: '13px 0',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  });

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav style={{
        background: '#0D1B2A',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 24px rgba(0,0,0,0.4)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Logo */}
          <Link to="/" onClick={closeMenu} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🏆</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1.5, color: 'white', lineHeight: 1 }}>
              Mestre do <span style={{ color: '#FFB800' }}>Placar</span>
            </span>
          </Link>

          {/* Links desktop */}
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <Link to="/mestre"     style={linkStyle('/mestre')}>⚽ Rodadas</Link>
            <Link to="/ranking"    style={linkStyle('/ranking')}>📊 Ranking</Link>
            <Link to="/ganhadores" style={linkStyle('/ganhadores')}>🏆 Ganhadores</Link>
            {user && <Link to="/perfil" style={linkStyle('/perfil')}>👤 Perfil</Link>}
            {user?.is_admin && (
              <Link to="/admin" style={{ ...linkStyle('/admin'), color: isActive('/admin') ? '#00C16A' : 'rgba(0,193,106,0.7)', borderBottomColor: isActive('/admin') ? '#00C16A' : 'transparent' }}>
                ⚙ Admin
              </Link>
            )}
          </div>

          {/* Auth buttons desktop */}
          <div className="nav-auth-desktop" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {user ? (
              <>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                  Olá, {user.nome.split(' ')[0]} 👋
                </span>
                <button
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontWeight: 500, minHeight: 36 }}
                  onClick={() => { logout(); navigate('/'); }}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, fontSize: 13, padding: '6px 14px', cursor: 'pointer', fontWeight: 500, minHeight: 36 }}>
                    Entrar
                  </button>
                </Link>
                <Link to="/register">
                  <button style={{ background: '#00C16A', border: 'none', color: 'white', borderRadius: 8, fontSize: 13, padding: '6px 16px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 12px rgba(0,193,106,0.4)', minHeight: 36 }}>
                    Cadastrar grátis
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Hamburguer mobile */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'none', // overridden by CSS on mobile
              flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              gap: 5, width: 44, height: 44,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, cursor: 'pointer', padding: 0, flexShrink: 0,
            }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: 20, height: 2, background: menuOpen ? '#FFB800' : 'white', transition: 'all 0.25s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 20, height: 2, background: menuOpen ? 'transparent' : 'white', transition: 'all 0.25s' }} />
            <span style={{ display: 'block', width: 20, height: 2, background: menuOpen ? '#FFB800' : 'white', transition: 'all 0.25s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="nav-mobile-menu"
            style={{
              display: 'none', // shown by CSS on mobile
              flexDirection: 'column',
              background: '#0D1B2A',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              padding: '0 1rem 1rem',
            }}
          >
            <Link to="/mestre"     style={mobileLinkStyle('/mestre')}     onClick={closeMenu}>⚽ Rodadas</Link>
            <Link to="/ranking"    style={mobileLinkStyle('/ranking')}    onClick={closeMenu}>📊 Ranking</Link>
            <Link to="/ganhadores" style={mobileLinkStyle('/ganhadores')} onClick={closeMenu}>🏆 Ganhadores</Link>
            {user && <Link to="/perfil" style={mobileLinkStyle('/perfil')} onClick={closeMenu}>👤 Perfil</Link>}
            {user?.is_admin && (
              <Link to="/admin" style={{ ...mobileLinkStyle('/admin'), color: isActive('/admin') ? '#00C16A' : 'rgba(0,193,106,0.8)' }} onClick={closeMenu}>
                ⚙ Admin
              </Link>
            )}

            <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user ? (
                <>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 500, paddingBottom: 4 }}>
                    Olá, {user.nome.split(' ')[0]} 👋
                  </div>
                  <button
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', borderRadius: 10, fontSize: 15, padding: '12px', cursor: 'pointer', fontWeight: 600, minHeight: 44 }}
                    onClick={() => { logout(); navigate('/'); closeMenu(); }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    <button style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)', borderRadius: 10, fontSize: 15, padding: '12px', cursor: 'pointer', fontWeight: 600, minHeight: 44 }}>
                      Entrar
                    </button>
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    <button style={{ width: '100%', background: '#00C16A', border: 'none', color: 'white', borderRadius: 10, fontSize: 15, padding: '12px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 12px rgba(0,193,106,0.4)', minHeight: 44 }}>
                      Cadastrar grátis
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop para fechar menu ao clicar fora */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'transparent' }}
        />
      )}
    </>
  );
}
