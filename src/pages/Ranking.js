import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const LEVELS = [
  { name: 'Bronze', min: 0, max: 10, icon: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)' },
  { name: 'Prata', min: 11, max: 30, icon: '🥈', color: '#aaa', bg: 'rgba(180,180,180,0.12)', border: 'rgba(180,180,180,0.3)' },
  { name: 'Ouro', min: 31, max: 100, icon: '🥇', color: '#FFB800', bg: 'rgba(255,184,0,0.12)', border: 'rgba(255,184,0,0.3)' },
  { name: 'Lenda', min: 101, max: Infinity, icon: '👑', color: '#00C16A', bg: 'rgba(0,193,106,0.12)', border: 'rgba(0,193,106,0.3)' },
];

function getLevel(acertos) {
  return LEVELS.find(l => acertos >= l.min && (l.max === Infinity || acertos <= l.max)) || LEVELS[0];
}

const css = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('geral');

  useEffect(() => {
    axios.get(`${API}/ranking`)
      .then(r => setRanking(r.data))
      .catch(() => setRanking([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  const medalhas = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh' }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A, #1a3050)', color: 'white', padding: '2.5rem 0' }}>
        <div className="container">
          <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
            Hall da Fama
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 52, letterSpacing: 2, marginBottom: '0.25rem' }}>
            📊 Ranking dos Mestres
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
            Os maiores acertadores da plataforma — conquiste seu lugar no topo!
          </p>
        </div>
      </div>

      {/* Níveis de gamificação */}
      <div style={{ background: '#0D1B2A', padding: '1.25rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {LEVELS.map(l => (
              <div key={l.name} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: l.bg, border: `1px solid ${l.border}`,
                borderRadius: 20, padding: '6px 16px',
              }}>
                <span style={{ fontSize: 18 }}>{l.icon}</span>
                <div>
                  <span style={{ color: l.color, fontWeight: 700, fontSize: 13 }}>{l.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 6 }}>
                    {l.max === Infinity ? `${l.min}+ acertos` : `${l.min}–${l.max} acertos`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Top 3 podium */}
        {ranking.length >= 3 && (
          <div style={{ display: 'flex', gap: 16, marginBottom: '2rem', alignItems: 'flex-end', justifyContent: 'center' }}>
            {[ranking[1], ranking[0], ranking[2]].map((p, idx) => {
              if (!p) return null;
              const pos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
              const heights = { 1: 160, 2: 120, 3: 100 };
              const lv = getLevel(p.acertos || 0);
              return (
                <div key={p.id || idx} style={{
                  textAlign: 'center', animation: `fadeInUp ${0.4 + idx * 0.1}s ease`,
                  flex: pos === 1 ? '0 0 200px' : '0 0 160px',
                }}>
                  <div style={{ fontSize: pos === 1 ? 48 : 32, marginBottom: 8 }}>{lv.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: pos === 1 ? 16 : 14, color: '#111', marginBottom: 4 }}>
                    {p.nome?.split(' ')[0]}***
                  </div>
                  <div style={{ fontSize: 12, color: lv.color, fontWeight: 600, marginBottom: 8 }}>{lv.name}</div>
                  <div style={{
                    background: pos === 1 ? 'linear-gradient(135deg, #0D1B2A, #1a3050)' : 'white',
                    borderRadius: '12px 12px 0 0',
                    height: heights[pos],
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                    boxShadow: pos === 1 ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
                    border: pos === 1 ? 'none' : '1px solid #eee',
                  }}>
                    <div style={{ fontSize: 28 }}>{medalhas[pos - 1]}</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: pos === 1 ? '#FFB800' : '#00C16A' }}>
                      {p.acertos || 0} acertos
                    </div>
                    <div style={{ fontSize: 11, color: pos === 1 ? 'rgba(255,255,255,0.5)' : '#aaa' }}>
                      {p.total_rodadas || 0} rodadas
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lista completa */}
        {ranking.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: '4rem 2rem',
            textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 64, marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: 22, color: '#111', marginBottom: '0.5rem' }}>Ranking em breve</h3>
            <p style={{ color: '#888' }}>Participe das rodadas e apareça no ranking!</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
            {ranking.map((p, i) => {
              const lv = getLevel(p.acertos || 0);
              return (
                <div key={p.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '1rem 1.25rem',
                  borderTop: i > 0 ? '1px solid #f5f5f5' : 'none',
                  background: i === 0 ? 'linear-gradient(90deg, rgba(255,184,0,0.05), transparent)' : 'white',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: i < 3 ? 'linear-gradient(135deg, #0D1B2A, #1a3050)' : '#f5f5f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: i < 3 ? 18 : 14, fontWeight: 700,
                    color: i < 3 ? 'white' : '#888',
                  }}>
                    {i < 3 ? medalhas[i] : `#${i + 1}`}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>
                      {p.nome?.split(' ')[0]}***
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>{p.total_rodadas || 0} rodadas jogadas</div>
                  </div>

                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: lv.bg, border: `1px solid ${lv.border}`,
                    borderRadius: 20, padding: '4px 12px',
                  }}>
                    <span style={{ fontSize: 14 }}>{lv.icon}</span>
                    <span style={{ color: lv.color, fontWeight: 700, fontSize: 12 }}>{lv.name}</span>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 80 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: '#00C16A', letterSpacing: 0.5 }}>
                      {p.acertos || 0}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>acertos</div>
                  </div>

                  {p.valor_ganho > 0 && (
                    <div style={{ textAlign: 'right', minWidth: 90 }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: '#FFB800' }}>
                        R$ {p.valor_ganho?.toLocaleString('pt-BR')}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>ganho</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
