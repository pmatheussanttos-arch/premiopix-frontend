import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const LEVELS = [
  { name: 'Bronze', min: 0,   max: 10,       icon: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)',  border: 'rgba(205,127,50,0.3)' },
  { name: 'Prata',  min: 11,  max: 30,        icon: '🥈', color: '#aaa',    bg: 'rgba(180,180,180,0.12)', border: 'rgba(180,180,180,0.3)' },
  { name: 'Ouro',   min: 31,  max: 100,       icon: '🥇', color: '#FFB800', bg: 'rgba(255,184,0,0.12)',   border: 'rgba(255,184,0,0.3)' },
  { name: 'Lenda',  min: 101, max: Infinity,  icon: '👑', color: '#00C16A', bg: 'rgba(0,193,106,0.12)',   border: 'rgba(0,193,106,0.3)' },
];

function getLevel(acertos) {
  return LEVELS.find(l => acertos >= l.min && (l.max === Infinity || acertos <= l.max)) || LEVELS[0];
}

const css = `
@keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

.ranking-header { padding: 2.5rem 0; }
.ranking-header h1 { font-size: clamp(28px, 6vw, 52px); }
.ranking-levels { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.ranking-podium { display: flex; gap: 16px; margin-bottom: 2rem; align-items: flex-end; justify-content: center; flex-wrap: wrap; }
.ranking-row    { display: flex; align-items: center; gap: 12px; padding: 1rem 1.25rem; border-top: 1px solid #f5f5f5; flex-wrap: wrap; }
.ranking-ganho  { text-align: right; min-width: 80px; }

@media (max-width: 600px) {
  .ranking-header { padding: 1.75rem 0; }
  .ranking-podium { gap: 8px; }
  .ranking-row    { gap: 8px; padding: 0.85rem 1rem; }
  .ranking-ganho  { display: none; }
  .level-range    { display: none; }
}

@media (max-width: 420px) {
  .ranking-podium { display: none; }
}
`;

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A, #1a3050)', color: 'white' }}>
        <div className="container ranking-header">
          <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Hall da Fama</p>
          <h1 style={{ fontFamily: "'Bebas Neue'", letterSpacing: 2, marginBottom: '0.25rem' }}>📊 Ranking dos Mestres</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Os maiores acertadores — conquiste seu lugar no topo!</p>
        </div>
      </div>

      {/* Níveis */}
      <div style={{ background: '#0D1B2A', padding: '1rem 0' }}>
        <div className="container">
          <div className="ranking-levels">
            {LEVELS.map(l => (
              <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: l.bg, border: `1px solid ${l.border}`, borderRadius: 20, padding: '5px 14px' }}>
                <span style={{ fontSize: 16 }}>{l.icon}</span>
                <div>
                  <span style={{ color: l.color, fontWeight: 700, fontSize: 13 }}>{l.name}</span>
                  <span className="level-range" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 6 }}>
                    {l.max === Infinity ? `${l.min}+` : `${l.min}–${l.max}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Pódio Top 3 */}
        {ranking.length >= 3 && (
          <div className="ranking-podium">
            {[ranking[1], ranking[0], ranking[2]].map((p, idx) => {
              if (!p) return null;
              const pos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
              const heights = { 1: 150, 2: 110, 3: 90 };
              const sizes  = { 1: 180, 2: 150, 3: 140 };
              const lv = getLevel(p.acertos || 0);
              return (
                <div key={p.id || idx} style={{ textAlign: 'center', animation: `fadeInUp ${0.4 + idx * 0.1}s ease`, flex: `0 0 ${sizes[pos]}px`, maxWidth: sizes[pos] }}>
                  <div style={{ fontSize: pos === 1 ? 40 : 28, marginBottom: 6 }}>{lv.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: pos === 1 ? 15 : 13, color: '#111', marginBottom: 3 }}>
                    {p.nome?.split(' ')[0]}***
                  </div>
                  <div style={{ fontSize: 11, color: lv.color, fontWeight: 600, marginBottom: 6 }}>{lv.name}</div>
                  <div style={{
                    background: pos === 1 ? 'linear-gradient(135deg, #0D1B2A, #1a3050)' : 'white',
                    borderRadius: '12px 12px 0 0',
                    height: heights[pos],
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                    boxShadow: pos === 1 ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
                    border: pos === 1 ? 'none' : '1px solid #eee',
                  }}>
                    <div style={{ fontSize: 24 }}>{medalhas[pos - 1]}</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: pos === 1 ? '#FFB800' : '#00C16A' }}>
                      {p.acertos || 0} ac.
                    </div>
                    <div style={{ fontSize: 10, color: pos === 1 ? 'rgba(255,255,255,0.5)' : '#aaa' }}>
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
          <div style={{ background: 'white', borderRadius: 20, padding: '3.5rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: 20, color: '#111', marginBottom: '0.5rem' }}>Ranking em breve</h3>
            <p style={{ color: '#888', fontSize: 14 }}>Participe das rodadas e apareça no ranking!</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
            {ranking.map((p, i) => {
              const lv = getLevel(p.acertos || 0);
              return (
                <div key={p.id || i} className="ranking-row" style={{ background: i === 0 ? 'linear-gradient(90deg, rgba(255,184,0,0.05), transparent)' : 'white', borderTop: i > 0 ? '1px solid #f5f5f5' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: i < 3 ? 'linear-gradient(135deg, #0D1B2A, #1a3050)' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? 16 : 13, fontWeight: 700, color: i < 3 ? 'white' : '#888' }}>
                    {i < 3 ? medalhas[i] : `#${i + 1}`}
                  </div>

                  <div style={{ flex: 1, minWidth: 80 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{p.nome?.split(' ')[0]}***</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{p.total_rodadas || 0} rodadas</div>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: lv.bg, border: `1px solid ${lv.border}`, borderRadius: 20, padding: '3px 10px' }}>
                    <span style={{ fontSize: 13 }}>{lv.icon}</span>
                    <span style={{ color: lv.color, fontWeight: 700, fontSize: 11 }}>{lv.name}</span>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 64 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: '#00C16A', letterSpacing: 0.5 }}>{p.acertos || 0}</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>acertos</div>
                  </div>

                  {p.valor_ganho > 0 && (
                    <div className="ranking-ganho">
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: '#FFB800' }}>R$ {p.valor_ganho?.toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 10, color: '#aaa' }}>ganho</div>
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
