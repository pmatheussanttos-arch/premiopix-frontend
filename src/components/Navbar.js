import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'nav-active' : '';

  return (
    <nav style={{background:'white',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:100}}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:60}}>
        <Link to="/" style={{textDecoration:'none'}}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:'var(--text)'}}>
            Prêmio<span style={{color:'var(--green)'}}>PIX</span>
          </span>
        </Link>

        <div style={{display:'flex',alignItems:'center',gap:'1.5rem'}}>
          <Link to="/placar-premiado" className={`nav-link ${isActive('/placar-premiado')}`} style={{textDecoration:'none',fontSize:14,color:'var(--muted)',fontWeight:500}}>
            🎯 Placar Premiado
          </Link>
          <Link to="/mestre" className={`nav-link ${isActive('/mestre')}`} style={{textDecoration:'none',fontSize:14,color:'var(--muted)',fontWeight:500}}>
            ✨ Mestre do Placar
          </Link>
          <Link to="/ganhadores" style={{textDecoration:'none',fontSize:14,color:'var(--muted)'}}>Ganhadores</Link>
          {user && (
            <Link to="/meus-jogos" style={{textDecoration:'none',fontSize:14,color:'var(--muted)'}}>Meus Jogos</Link>
          )}
          {user?.is_admin && (
            <Link to="/admin" style={{textDecoration:'none',fontSize:14,color:'var(--purple)'}}>⚙ Admin</Link>
          )}
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {user ? (
            <>
              <span style={{fontSize:14,color:'var(--muted)'}}>Olá, {user.nome.split(' ')[0]}</span>
              <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn btn-outline">Entrar</button></Link>
              <Link to="/register"><button className="btn btn-primary">Cadastrar</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
