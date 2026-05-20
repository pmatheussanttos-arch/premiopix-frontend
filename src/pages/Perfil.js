import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const LEVELS = [
  { name: 'Bronze', min: 0, max: 10, icon: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.1)', border: 'rgba(205,127,50,0.25)', next: 11 },
  { name: 'Prata', min: 11, max: 30, icon: '🥈', color: '#9e9e9e', bg: 'rgba(158,158,158,0.1)', border: 'rgba(158,158,158,0.25)', next: 31 },
  { name: 'Ouro', min: 31, max: 100, icon: '🥇', color: '#FFB800', bg: 'rgba(255,184,0,0.1)', border: 'rgba(255,184,0,0.25)', next: 101 },
  { name: 'Lenda', min: 101, max: Infinity, icon: '👑', color: '#00C16A', bg: 'rgba(0,193,106,0.1)', border: 'rgba(0,193,106,0.25)', next: null },
];

function getLevel(acertos) {
  return LEVELS.find(l => acertos >= l.min && (l.max === Infinity || acertos <= l.max)) || LEVELS[0];
}

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

  const acertos = palpites.filter(p => p.acertou === true).length;
  const totalGanho = palpites.reduce((s, p) => s + (p.valor_premio || 0), 0);
  const pagos = palpites.filter(p => p.status_pag === 'aprovado').length;
  const lv = getLevel(acertos);
  const nextLv = LEVELS[LEVELS.indexOf(lv) + 1];
  const progressPct = nextLv
    ? Math.min(100, Math.round(((acertos - lv.min) / (lv.next - lv.min)) * 100))
    : 100;

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A, #1a3050)', color: 'white', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${lv.color}, ${lv.color}99)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: `0 0 0 4px ${lv.color}33`,
              flexShrink: 0,
            }}>
              {lv.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 1, margin: 0 }}>
                  {user?.nome?.split(' ')[0]}
                </h1>
                <span style={{
                  background: lv.bg, border: `1px solid ${lv.border}`,
                  color: lv.color, borderRadius: 20, fontSize: 13,
                  padding: '3px 12px', fontWeight: 700,
                }}>
                  {lv.icon} {lv.name}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>{user?.email}</p>
            </div>
          </div>

          {/* Barra de progresso */}
          {nextLv && (
            <div style={{ marginTop: '1.5rem', maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: lv.color, fontWeight: 600 }}>{lv.icon} {lv.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{acertos}/{lv.next} acertos para {nextLv.name}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: `linear-gradient(90deg, ${lv.color}, ${lv.color}99)`,
                  width: `${progressPct}%`,
                  transition: 'width 0.8s ease',
                }} />
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

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14, marginBottom: '2rem' }}>
          {[
            { icon: '🎯', label: 'Total de Palpites', val: palpites.length },
            { icon: '✅', label: 'Pagamentos', val: pagos },
            { icon: '🏆', label: 'Acertos', val: acertos },
            { icon: '💰', label: 'Total Ganho', val: `R$ ${totalGanho.toFixed(2)}` },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{
              background: 'white', borderRadius: 14, padding: '1.2rem',
              textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: '#111', letterSpacing: 0.5 }}>{val}</div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Níveis */}
        <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1rem', color: '#111' }}>🎖 Níveis da Plataforma</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
            {LEVELS.map(l => (
              <div key={l.name} style={{
                background: l.name === lv.name ? l.bg : '#fafafa',
                border: `2px solid ${l.name === lv.name ? l.color : '#eee'}`,
                borderRadius: 12, padding: '12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{l.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: l.color }}>{l.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  {l.max === Infinity ? `${l.min}+ acertos` : `${l.min}–${l.max}`}
                </div>
                {l.name === lv.name && (
                  <div style={{ marginTop: 6, fontSize: 10, color: l.color, fontWeight: 700 }}>← SEU NÍVEL</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Histórico */}
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: '1rem', color: '#111' }}>📋 Histórico de Palpites</h3>

          {palpites.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: 20, padding: '3rem 2rem',
              textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 56, marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: 20, color: '#111', marginBottom: '0.5rem' }}>Nenhum palpite ainda</h3>
              <p style={{ color: '#888', marginBottom: '1.5rem' }}>Participe de uma rodada e apareça no ranking!</p>
              <Link to="/mestre">
                <button style={{
                  background: '#00C16A', color: 'white', border: 'none', borderRadius: 12,
                  padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}>
                  ⚽ Ver Rodadas
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {palpites.slice().reverse().map(p => {
                const stColor = p.status_pag === 'aprovado' ? '#00C16A' : p.status_pag === 'pendente' ? '#FFB800' : '#aaa';
                const stLabel = p.status_pag === 'aprovado' ? 'Pago ✅' : p.status_pag === 'pendente' ? 'Aguardando PIX ⏳' : p.status_pag;
                return (
                  <div key={p.id} style={{
                    background: 'white', borderRadius: 14, padding: '1.1rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    borderLeft: `4px solid ${stColor}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>
                        ⚽ {p.time_casa} × {p.time_fora}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                        {new Date(p.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{
                      background: '#f0f9f4', borderRadius: 10, padding: '6px 14px', textAlign: 'center',
                      border: '1px solid #c6edd9',
                    }}>
                      <div style={{ fontSize: 10, color: '#888', marginBottom: 1 }}>Palpite</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: '#00C16A', letterSpacing: 1 }}>
                        {p.gols_casa} × {p.gols_fora}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      <span style={{
                        background: stColor + '15', color: stColor,
                        borderRadius: 20, fontSize: 11, padding: '3px 10px', fontWeight: 600,
                        border: `1px solid ${stColor}33`,
                      }}>
                        {stLabel}
                      </span>
                      {p.acertou === true && (
                        <span style={{
                          background: '#fffbeb', color: '#FFB800', border: '1px solid #ffe082',
                          borderRadius: 20, fontSize: 11, padding: '3px 10px', fontWeight: 700,
                        }}>
                          🏆 Ganhou R$ {p.valor_premio?.toFixed(2)}
                        </span>
                      )}
                      {p.acertou === false && (
                        <span style={{
                          background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                          borderRadius: 20, fontSize: 11, padding: '3px 10px', fontWeight: 600,
                        }}>
                          ❌ Não acertou
                        </span>
                      )}
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
