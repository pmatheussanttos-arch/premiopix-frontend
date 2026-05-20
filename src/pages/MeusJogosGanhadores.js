import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

export function MeusJogos() {
  const [palpites, setPalpites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/palpites/meus`)
      .then(r => setPalpites(r.data))
      .catch(() => setPalpites([]))
      .finally(() => setLoading(false));
  }, []);

  const statusInfo = (s) => {
    if (s === 'aprovado') return { label: 'Pago ✅', bg: '#e6fff3', color: '#00C16A', border: '#c6edd9' };
    if (s === 'pendente') return { label: 'Aguardando PIX ⏳', bg: '#fffbeb', color: '#FFB800', border: '#ffe082' };
    return { label: s, bg: '#f5f5f5', color: '#888', border: '#e0e0e0' };
  };

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #071a2e, #0d2d4a)', color: 'white', padding: '2.5rem 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 2, marginBottom: '0.25rem' }}>
            📋 Meus Jogos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>
            Acompanhe seus palpites e resultados
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Resumo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: '2rem' }}>
          {[
            { icon: '🎯', label: 'Total de Palpites', val: palpites.length },
            { icon: '✅', label: 'Pagos', val: palpites.filter(p => p.status_pag === 'aprovado').length },
            { icon: '🏆', label: 'Acertos', val: palpites.filter(p => p.acertou === true).length },
            { icon: '💰', label: 'Prêmios', val: `R$ ${palpites.filter(p => p.valor_premio).reduce((s, p) => s + (p.valor_premio || 0), 0).toFixed(2)}` },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{
              background: 'white', borderRadius: 14, padding: '1rem',
              textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#111', letterSpacing: 0.5 }}>{val}</div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {palpites.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: '4rem 2rem',
            textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 64, marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ fontSize: 22, marginBottom: '0.5rem', color: '#111' }}>Nenhuma aposta ainda</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Faça seu primeiro palpite e concorra ao prêmio!</p>
            <Link to="/placar-premiado">
              <button style={{
                background: '#00C16A', color: 'white', border: 'none', borderRadius: 12,
                padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
                ⚽ Ver Jogos Disponíveis
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {palpites.map(p => {
              const st = statusInfo(p.status_pag);
              return (
                <div key={p.id} style={{
                  background: 'white', borderRadius: 16, padding: '1.2rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  borderLeft: `4px solid ${st.color}`,
                }}>
                  {/* Time info */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 4 }}>
                      ⚽ {p.time_casa} × {p.time_fora}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      📅 {new Date(p.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Palpite */}
                  <div style={{
                    background: '#f0f9f4', borderRadius: 10, padding: '8px 16px', textAlign: 'center',
                    border: '1px solid #c6edd9',
                  }}>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Seu palpite</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: '#00C16A', letterSpacing: 1 }}>
                      {p.gols_casa} × {p.gols_fora}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      borderRadius: 20, fontSize: 12, padding: '4px 12px', fontWeight: 600,
                    }}>
                      {st.label}
                    </span>
                    {p.acertou === true && (
                      <span style={{
                        background: '#fffbeb', color: '#FFB800', border: '1px solid #ffe082',
                        borderRadius: 20, fontSize: 12, padding: '4px 12px', fontWeight: 700,
                      }}>
                        🏆 Ganhou R$ {p.valor_premio?.toFixed(2)}
                      </span>
                    )}
                    {p.acertou === false && (
                      <span style={{
                        background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                        borderRadius: 20, fontSize: 12, padding: '4px 12px', fontWeight: 600,
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
  );
}

export function Ganhadores() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/ganhadores/`)
      .then(r => setLista(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #071a2e, #0d2d4a)', color: 'white', padding: '2.5rem 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 52, letterSpacing: 2, marginBottom: '0.25rem' }}>
            🏆 Ganhadores
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>
            Histórico de prêmios pagos — Acerte o Placar, Ganhe o PIX!
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {lista.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: '4rem 2rem',
            textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 64, marginBottom: '1rem' }}>🏆</div>
            <h3 style={{ fontSize: 22, color: '#111', marginBottom: '0.5rem' }}>Nenhum ganhador ainda</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Seja o primeiro a acertar o placar e ganhar!</p>
            <Link to="/placar-premiado">
              <button style={{
                background: '#00C16A', color: 'white', border: 'none', borderRadius: 12,
                padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
                ⚽ Apostar Agora
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #071a2e, #0d2d4a)', color: 'white' }}>
                  {['🏆 Ganhador', '⚽ Jogo', '🎯 Placar', '💰 Prêmio'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((g, i) => (
                  <tr key={i} style={{
                    borderTop: '1px solid #f0f0f0',
                    background: i % 2 === 0 ? 'white' : '#fafafa',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0faf5'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFB800, #ff8f00)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                        }}>🏆</div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{g.nome?.split(' ')[0]}***</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#555' }}>{g.detalhe}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: '#e6fff3', color: '#00C16A', border: '1px solid #c6edd9',
                        borderRadius: 20, fontSize: 12, padding: '3px 10px', fontWeight: 600,
                      }}>{g.tipo}</span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <span style={{
                        fontFamily: "'Bebas Neue'", fontSize: 22, color: '#FFB800', letterSpacing: 1,
                      }}>
                        R$ {g.valor_premio?.toLocaleString('pt-BR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
