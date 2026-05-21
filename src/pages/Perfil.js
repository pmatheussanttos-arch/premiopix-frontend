import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const LEVELS = [
  { name: 'Bronze', min: 0,   max: 10,      icon: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.1)',  border: 'rgba(205,127,50,0.25)',  next: 11 },
  { name: 'Prata',  min: 11,  max: 30,       icon: '🥈', color: '#9e9e9e', bg: 'rgba(158,158,158,0.1)', border: 'rgba(158,158,158,0.25)', next: 31 },
  { name: 'Ouro',   min: 31,  max: 100,      icon: '🥇', color: '#FFB800', bg: 'rgba(255,184,0,0.1)',   border: 'rgba(255,184,0,0.25)',   next: 101 },
  { name: 'Lenda',  min: 101, max: Infinity, icon: '👑', color: '#00C16A', bg: 'rgba(0,193,106,0.1)',   border: 'rgba(0,193,106,0.25)',   next: null },
];

function getLevel(acertos) {
  return LEVELS.find(l => acertos >= l.min && (l.max === Infinity || acertos <= l.max)) || LEVELS[0];
}

const css = `
.perfil-stats  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 2rem; }
.perfil-niveis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.palpite-row   { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

@media (max-width: 640px) {
  .perfil-stats  { grid-template-columns: 1fr 1fr; gap: 10px; }
  .perfil-niveis { grid-template-columns: 1fr 1fr; }
  .palpite-row   { gap: 8px; }
}
`;

export default function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [palpites, setPalpites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get(`${API}/palpites/meus`)
      .then(r => setPalpites(r.data))
      .catch(() => setPalpites([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  const acertos   = palpites.filter(p => p.acertou === true).length;
  const totalGanho = palpites.reduce((s, p) => s + (p.valor_premio || 0), 0);
  const pagos     = palpites.filter(p => p.status_pag === 'aprovado').length;
  const lv        = getLevel(acertos);
  const nextLv    = LEVELS[LEVELS.indexOf(lv) + 1];
  const progressPct = nextLv ? Math.min(100, Math.round(((acertos - lv.min) / (lv.next - lv.min)) * 100)) : 100;

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh' }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A, #1a3050)', color: 'white', padding: '2rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${lv.color}, ${lv.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: `0 0 0 4px ${lv.color}33`, flexShrink: 0 }}>
              {lv.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 1, margin: 0 }}>
                  {user?.nome?.split(' ')[0]}
                </h1>
                <span style={{ background: lv.bg, border: `1px solid ${lv.border}`, color: lv.color, borderRadius: 20, fontSize: 12, padding: '3px 12px', fontWeight: 700 }}>
                  {lv.icon} {lv.name}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>{user?.email}</p>
            </div>
          </div>

          {/* Barra de progresso */}
          {nextLv && (
            <div style={{ marginTop: '1.25rem', maxWidth: 380 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: lv.color, fontWeight: 600 }}>{lv.icon} {lv.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{acertos}/{lv.next} para {nextLv.name}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${lv.color}, ${lv.color}99)`, width: `${progressPct}%`, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          )}
          {!nextLv && (
            <div style={{ marginTop: '1rem', fontSize: 14, color: '#00C16A', fontWeight: 600 }}>
              👑 Você é uma Lenda! Nível máximo atingido!
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '1.5rem 0 3rem' }}>
        {/* Stats */}
        <div className="perfil-stats">
          {[
            { icon: '🎯', label: 'Total de Palpites', val: palpites.length },
            { icon: '✅', label: 'Pagamentos',         val: pagos },
            { icon: '🏆', label: 'Acertos',            val: acertos },
            { icon: '💰', label: 'Total Ganho',        val: `R$ ${totalGanho.toFixed(2)}` },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ background: 'white', borderRadius: 14, padding: '1rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: '#111', letterSpacing: 0.5 }}>{val}</div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Níveis */}
        <div style={{ background: 'white', borderRadius: 20, padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem', color: '#111' }}>🎖 Níveis da Plataforma</h3>
          <div className="perfil-niveis">
            {LEVELS.map(l => (
              <div key={l.name} style={{ background: l.name === lv.name ? l.bg : '#fafafa', border: `2px solid ${l.name === lv.name ? l.color : '#eee'}`, borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{l.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: l.color }}>{l.name}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                  {l.max === Infinity ? `${l.min}+` : `${l.min}–${l.max}`}
                </div>
                {l.name === lv.name && (
                  <div style={{ marginTop: 5, fontSize: 10, color: l.color, fontWeight: 700 }}>SEU NÍVEL</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Histórico */}
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1rem', color: '#111' }}>📋 Histórico de Palpites</h3>

          {palpites.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, padding: '3rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 52, marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: 18, color: '#111', marginBottom: '0.5rem' }}>Nenhum palpite ainda</h3>
              <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: 14 }}>Participe de uma rodada e apareça no ranking!</p>
              <Link to="/mestre">
                <button style={{ background: '#00C16A', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 48 }}>
                  ⚽ Ver Rodadas
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {palpites.slice().reverse().map(p => {
                const stColor = p.status_pag === 'aprovado' ? '#00C16A' : p.status_pag === 'pendente' ? '#FFB800' : '#aaa';
                const stLabel = p.status_pag === 'aprovado' ? 'Pago ✅' : p.status_pag === 'pendente' ? 'Aguardando ⏳' : p.status_pag;
                return (
                  <div key={p.id} style={{ background: 'white', borderRadius: 14, padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: `4px solid ${stColor}` }}>
                    <div className="palpite-row">
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>
                          ⚽ {p.time_casa} × {p.time_fora}
                        </div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                          {new Date(p.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={{ background: '#f0f9f4', borderRadius: 10, padding: '6px 12px', textAlign: 'center', border: '1px solid #c6edd9', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: '#888', marginBottom: 1 }}>Palpite</div>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: '#00C16A', letterSpacing: 1 }}>
                          {p.gols_casa} × {p.gols_fora}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                        <span style={{ background: stColor + '15', color: stColor, borderRadius: 20, fontSize: 11, padding: '3px 10px', fontWeight: 600, border: `1px solid ${stColor}33` }}>
                          {stLabel}
                        </span>
                        {p.acertou === true && (
                          <span style={{ background: '#fffbeb', color: '#FFB800', border: '1px solid #ffe082', borderRadius: 20, fontSize: 11, padding: '3px 10px', fontWeight: 700 }}>
                            🏆 R$ {p.valor_premio?.toFixed(2)}
                          </span>
                        )}
                        {p.acertou === false && (
                          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 20, fontSize: 11, padding: '3px 10px', fontWeight: 600 }}>
                            ❌ Não acertou
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
