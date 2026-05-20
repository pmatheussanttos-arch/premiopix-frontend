import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const pulse = `
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

export default function Home() {
  const [jogos, setJogos] = useState([]);
  const [ganhadores, setGanhadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/jogos/publico`).catch(() => ({ data: [] })),
      axios.get(`${API}/ganhadores/`).catch(() => ({ data: [] })),
    ]).then(([j, g]) => {
      setJogos(j.data.slice(0, 4));
      setGanhadores(g.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div>
      <style>{pulse}</style>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #071a2e 0%, #0d2d4a 50%, #071a2e 100%)',
        color: 'white',
        padding: '5rem 0 4rem',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Emojis de fundo decorativos */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: 80, opacity: 0.06, animation: 'float 4s ease-in-out infinite' }}>⚽</div>
        <div style={{ position: 'absolute', top: '20%', right: '6%', fontSize: 60, opacity: 0.07, animation: 'float 5s ease-in-out infinite 1s' }}>🏆</div>
        <div style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: 50, opacity: 0.06, animation: 'float 6s ease-in-out infinite 0.5s' }}>💰</div>
        <div style={{ position: 'absolute', bottom: '10%', right: '8%', fontSize: 70, opacity: 0.06, animation: 'float 4.5s ease-in-out infinite 2s' }}>🎯</div>

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,193,106,0.15)',
            border: '1px solid rgba(0,193,106,0.4)',
            borderRadius: 20,
            padding: '6px 18px',
            fontSize: 13,
            color: '#00C16A',
            fontWeight: 600,
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.6s ease',
          }}>
            🏆 Concurso de habilidade esportiva
          </div>

          <h1 style={{
            fontSize: 'clamp(38px,8vw,76px)',
            lineHeight: 1.05,
            marginBottom: '1rem',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: 2,
            animation: 'fadeInUp 0.7s ease',
          }}>
            Acerte o Placar,<br />
            <span style={{ color: '#FFB800' }}>Ganhe o PIX!</span>
          </h1>

          <p style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.72)',
            maxWidth: 500,
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
            animation: 'fadeInUp 0.8s ease',
          }}>
            Escolha o placar do jogo, pague via PIX e concorra ao prêmio.<br />
            <strong style={{ color: 'white' }}>Simples, rápido e seguro!</strong>
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.9s ease' }}>
            <Link to="/placar-premiado">
              <button style={{
                background: '#00C16A',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,193,106,0.4)',
                animation: 'pulse 2.5s ease-in-out infinite',
              }}>
                ⚽ Apostar Agora
              </button>
            </Link>
            <Link to="/ganhadores">
              <button style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                🏆 Ver Ganhadores
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ background: '#00C16A', color: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['💰', 'Prêmios Pagos', 'R$ 12.400+'],
            ['⚽', 'Apostas Realizadas', '3.820+'],
            ['🏆', 'Ganhadores', '847+'],
            ['✅', 'Pagamentos no Prazo', '98%'],
          ].map(([icon, label, val]) => (
            <div key={label} style={{
              padding: '1rem 2.5rem',
              textAlign: 'center',
              borderRight: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{ fontSize: 22, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: 'white', letterSpacing: 1 }}>{val}</div>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── JOGOS ABERTOS ── */}
      {jogos.length > 0 && (
        <section style={{ padding: '4rem 0', background: '#f8fafb' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: '#00C16A', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Disponível agora</p>
                <h2 style={{ fontSize: 36, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>⚽ Jogos Abertos</h2>
              </div>
              <Link to="/placar-premiado">
                <button className="btn btn-outline" style={{ fontSize: 13 }}>Ver todos →</button>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
              {jogos.map(j => (
                <div key={j.id} style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '1.2rem',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  borderTop: '3px solid #00C16A',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: '#00C16A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{j.campeonato}</span>
                    <span style={{ background: '#e6fff3', color: '#00C16A', borderRadius: 20, fontSize: 11, padding: '2px 10px', fontWeight: 600 }}>● Aberto</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#111' }}>
                    {j.time_casa} <span style={{ color: '#bbb' }}>×</span> {j.time_fora}
                  </h3>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff8e1, #fff3cc)',
                    borderRadius: 10,
                    padding: '10px',
                    textAlign: 'center',
                    marginBottom: 12,
                    border: '1px solid #ffe082',
                  }}>
                    <div style={{ fontSize: 11, color: '#b45309', marginBottom: 2 }}>💰 Prêmio</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#FFB800', letterSpacing: 1 }}>
                      R$ {j.premio_fixo?.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>
                    📅 {new Date(j.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    &nbsp;·&nbsp; {j.total_apostas || 0} apostas
                  </div>
                  <Link to={`/placar/${j.id}`}>
                    <button style={{
                      width: '100%', background: '#00C16A', color: 'white', border: 'none',
                      borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    }}>
                      Apostar — R$ {j.valor_palpite?.toFixed(2)}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COMO FUNCIONA ── */}
      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div className="container">
          <p style={{ color: '#00C16A', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 8 }}>É muito fácil</p>
          <h2 style={{ textAlign: 'center', fontSize: 40, fontFamily: "'Bebas Neue'", letterSpacing: 1, marginBottom: '0.5rem' }}>Como Funciona?</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '3rem', fontSize: 15 }}>Em 3 passos simples você já está concorrendo</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '⚽', title: 'Escolha o Jogo', desc: 'Selecione o jogo disponível na plataforma e escolha o placar exato que você acredita.' },
              { step: '02', icon: '📱', title: 'Pague via PIX', desc: 'Pague rapidamente via QR Code PIX. O pagamento é instantâneo e 100% seguro.' },
              { step: '03', icon: '🏆', title: 'Receba o Prêmio', desc: 'Acertou o placar? O prêmio cai na sua chave PIX automaticamente após o jogo!' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{
                textAlign: 'center',
                padding: '2rem 1.5rem',
                borderRadius: 16,
                background: '#f8fafb',
                position: 'relative',
                border: '1px solid #eee',
              }}>
                <div style={{
                  position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                  background: '#00C16A', color: 'white', borderRadius: 20,
                  padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 1,
                }}>
                  PASSO {step}
                </div>
                <div style={{ fontSize: 48, marginBottom: '1rem', marginTop: '0.5rem' }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: '0.75rem', color: '#111' }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/placar-premiado">
              <button style={{
                background: '#00C16A', color: 'white', border: 'none', borderRadius: 12,
                padding: '14px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,193,106,0.35)',
              }}>
                ⚽ Quero Apostar Agora!
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ÚLTIMOS GANHADORES ── */}
      {ganhadores.length > 0 && (
        <section style={{ padding: '4rem 0', background: '#f8fafb' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Prêmios pagos</p>
                <h2 style={{ fontSize: 36, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>🏆 Últimos Ganhadores</h2>
              </div>
              <Link to="/ganhadores">
                <button className="btn btn-outline" style={{ fontSize: 13 }}>Ver todos →</button>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
              {ganhadores.map((g, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #fffbeb, #fff)',
                  borderRadius: 14,
                  padding: '1.2rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #ffe082',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFB800, #ff8f00)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>🏆</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{g.nome?.split(' ')[0]}***</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{g.tipo}</div>
                    </div>
                  </div>
                  <div style={{ background: 'white', borderRadius: 10, padding: '10px', textAlign: 'center', border: '1px solid #f0e0a0' }}>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Prêmio recebido via PIX</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#FFB800' }}>R$ {g.valor_premio?.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: '#071a2e', color: 'white', padding: '3.5rem 0 2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <span style={{ fontSize: 24 }}>⚽</span>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 1 }}>
                  Prêmio<span style={{ color: '#00C16A' }}>PIX</span>
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                Plataforma de concursos de habilidade esportiva. Acerte o placar e ganhe via PIX.
              </p>
            </div>
            <div>
              <h5 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Links</h5>
              {[['⚽ Placar Premiado', '/placar-premiado'], ['🏆 Ganhadores', '/ganhadores'], ['📋 Meus Jogos', '/meus-jogos']].map(([label, to]) => (
                <div key={to}>
                  <Link to={to} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 13, display: 'block', marginBottom: 8 }}>
                    {label}
                  </Link>
                </div>
              ))}
            </div>
            <div>
              <h5 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Suporte</h5>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                Dúvidas? Fale conosco pelo WhatsApp.
              </p>
              <p style={{ fontSize: 13, color: '#00C16A', fontWeight: 600, marginTop: 8 }}>Pago via PIX ✅</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '1rem',
              fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: '1rem', lineHeight: 1.7,
            }}>
              <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Concurso de habilidade esportiva.</strong>{' '}
              A participação consiste na escolha de placares com base em conhecimento esportivo,
              não caracterizando jogo de azar, rifa ou sorteio nos termos da legislação vigente.
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
              © 2026 PrêmioPIX. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
