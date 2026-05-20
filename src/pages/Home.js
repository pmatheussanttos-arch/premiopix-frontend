import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const css = `
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`;

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate) - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[['h', time.h], ['m', time.m], ['s', time.s]].map(([label, val]) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: 10,
            padding: '8px 14px', minWidth: 52,
            fontFamily: "'Bebas Neue'", fontSize: 32, color: '#FFB800', letterSpacing: 2,
          }}>
            {pad(val)}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [desafios, setDesafios] = useState([]);
  const [ganhadores, setGanhadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/mestre/publico/jogos`).catch(() => ({ data: [] })),
      axios.get(`${API}/ganhadores/`).catch(() => ({ data: [] })),
    ]).then(([d, g]) => {
      setDesafios(d.data.slice(0, 3));
      setGanhadores(g.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  const jackpot = desafios[0]?.valor_premio || 0;
  const nextGame = desafios[0]?.jogos?.[0]?.data_hora;

  return (
    <div>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1a3050 50%, #0D1B2A 100%)',
        color: 'white',
        padding: '5rem 0 4rem',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: '8%', left: '4%', fontSize: 90, opacity: 0.05, animation: 'float 4s ease-in-out infinite' }}>⚽</div>
        <div style={{ position: 'absolute', top: '15%', right: '5%', fontSize: 70, opacity: 0.06, animation: 'float 5s ease-in-out infinite 1s' }}>🏆</div>
        <div style={{ position: 'absolute', bottom: '10%', left: '8%', fontSize: 55, opacity: 0.05, animation: 'float 6s ease-in-out infinite 0.5s' }}>💰</div>
        <div style={{ position: 'absolute', bottom: '12%', right: '7%', fontSize: 65, opacity: 0.05, animation: 'float 4.5s ease-in-out infinite 2s' }}>🎯</div>

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,184,0,0.1)',
            border: '1px solid rgba(255,184,0,0.3)',
            borderRadius: 20, padding: '6px 18px',
            fontSize: 13, color: '#FFB800', fontWeight: 700,
            marginBottom: '1.5rem', letterSpacing: 0.5,
            animation: 'fadeInUp 0.6s ease',
          }}>
            👑 Concurso de habilidade esportiva
          </div>

          <h1 style={{
            fontSize: 'clamp(42px,9vw,82px)',
            lineHeight: 1.0,
            marginBottom: '0.75rem',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: 3,
            animation: 'fadeInUp 0.7s ease',
          }}>
            Mestre do<br />
            <span style={{
              background: 'linear-gradient(90deg, #FFB800, #ff8f00, #FFB800)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              Placar
            </span>
          </h1>

          <p style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 520,
            margin: '0 auto 2rem',
            lineHeight: 1.65,
            animation: 'fadeInUp 0.8s ease',
          }}>
            Acerte os placares de 5 jogos e concorra ao <strong style={{ color: 'white' }}>jackpot!</strong><br />
            Pague via PIX · Receba via PIX · Simples assim.
          </p>

          {/* Jackpot display */}
          {jackpot > 0 && (
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,184,0,0.08)',
              border: '1px solid rgba(255,184,0,0.2)',
              borderRadius: 20, padding: '1.2rem 2.5rem',
              marginBottom: '2rem',
              animation: 'fadeInUp 0.85s ease',
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                🏆 Jackpot da próxima rodada
              </div>
              <div style={{
                fontFamily: "'Bebas Neue'", fontSize: 52, letterSpacing: 2,
                background: 'linear-gradient(90deg, #FFB800, #ff8f00)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                R$ {jackpot.toLocaleString('pt-BR')}
              </div>
              {nextGame && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: 1 }}>
                    COMEÇA EM
                  </div>
                  <Countdown targetDate={nextGame} />
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.95s ease' }}>
            <Link to="/mestre">
              <button style={{
                background: 'linear-gradient(135deg, #00C16A, #00a857)',
                color: 'white', border: 'none', borderRadius: 14,
                padding: '15px 36px', fontSize: 17, fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(0,193,106,0.45)',
                animation: 'pulse 2.5s ease-in-out infinite',
                letterSpacing: 0.3,
              }}>
                ⚽ Participar da Rodada
              </button>
            </Link>
            <Link to="/ranking">
              <button style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.8)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: 14, padding: '15px 36px',
                fontSize: 17, fontWeight: 600, cursor: 'pointer',
              }}>
                📊 Ver Ranking
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#00C16A', color: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['👑', 'Mestres do Placar', '2.400+'],
            ['💰', 'Prêmios Pagos', 'R$ 48.900+'],
            ['⚽', 'Rodadas Realizadas', '180+'],
            ['✅', 'Pagamentos no Prazo', '100%'],
          ].map(([icon, label, val]) => (
            <div key={label} style={{
              padding: '1rem 2.5rem',
              textAlign: 'center',
              borderRight: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 1 }}>{val}</div>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RODADAS ABERTAS ── */}
      {desafios.length > 0 && (
        <section style={{ padding: '4rem 0', background: '#f8fafb' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                  Disponível agora
                </p>
                <h2 style={{ fontSize: 38, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>⚽ Rodadas Abertas</h2>
              </div>
              <Link to="/mestre">
                <button style={{
                  background: 'transparent', border: '1px solid #ddd', color: '#555',
                  borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  Ver todas →
                </button>
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
              {desafios.map(d => (
                <div key={d.id} style={{
                  background: 'white', borderRadius: 18, overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                  borderTop: '3px solid #FFB800',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)'; }}
                >
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {d.campeonato || 'Futebol'}
                      </span>
                      <span style={{ background: '#e6fff3', color: '#00C16A', borderRadius: 20, fontSize: 11, padding: '2px 10px', fontWeight: 600 }}>
                        ● Aberto
                      </span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 12 }}>{d.titulo}</h3>

                    <div style={{
                      background: 'linear-gradient(135deg, #fffbeb, #fff8d6)',
                      borderRadius: 12, padding: '12px',
                      textAlign: 'center', marginBottom: 12,
                      border: '1px solid #ffe082',
                    }}>
                      <div style={{ fontSize: 10, color: '#92400e', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        💰 Jackpot
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, color: '#FFB800', letterSpacing: 1 }}>
                        R$ {d.valor_premio?.toLocaleString('pt-BR')}
                      </div>
                      <div style={{ fontSize: 10, color: '#92400e' }}>dividido entre quem acertar tudo</div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      {d.jogos?.slice(0, 3).map((j, i) => (
                        <div key={j.id} style={{ fontSize: 12, color: '#666', padding: '3px 0', borderBottom: '1px solid #f5f5f5' }}>
                          {i + 1}. {j.time_casa} × {j.time_fora}
                        </div>
                      ))}
                      {d.jogos?.length > 3 && (
                        <div style={{ fontSize: 11, color: '#FFB800', fontWeight: 600, marginTop: 4 }}>
                          +{d.jogos.length - 3} jogos...
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#888' }}>
                        👥 {d.participantes || 0} participantes · R$ {d.valor_cartela?.toFixed(2)}/cartela
                      </span>
                    </div>
                  </div>
                  <Link to={`/mestre/comprar/${d.id}`}>
                    <button style={{
                      width: '100%', background: '#0D1B2A', color: 'white',
                      border: 'none', padding: '13px', fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', letterSpacing: 0.3,
                    }}>
                      🎯 Participar — R$ {d.valor_cartela?.toFixed(2)}
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
          <p style={{ color: '#00C16A', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 }}>
            É simples assim
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 42, fontFamily: "'Bebas Neue'", letterSpacing: 1, marginBottom: '0.5rem' }}>
            Como Virar um Mestre?
          </h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '3rem', fontSize: 15 }}>
            Em 3 passos você está concorrendo ao jackpot
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '⚽', title: 'Escolha a Rodada', desc: 'Selecione uma rodada com 5 jogos. Quanto mais participantes, maior o jackpot para quem acertar tudo!' },
              { step: '02', icon: '🎯', title: 'Preencha os Placares', desc: 'Coloque o placar exato que você prevê para cada um dos 5 jogos da rodada.' },
              { step: '03', icon: '💰', title: 'Pague e Torça!', desc: 'Pague via PIX instantaneamente. Se acertar os placares, o prêmio cai na sua chave PIX!' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem 2rem',
                borderRadius: 18,
                background: '#f8fafb',
                position: 'relative',
                border: '1px solid #eee',
              }}>
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: '#0D1B2A', color: '#FFB800', borderRadius: 20,
                  padding: '3px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1,
                }}>
                  PASSO {step}
                </div>
                <div style={{ fontSize: 50, marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: '0.75rem', color: '#111' }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/mestre">
              <button style={{
                background: 'linear-gradient(135deg, #00C16A, #00a857)',
                color: 'white', border: 'none', borderRadius: 14,
                padding: '14px 40px', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,193,106,0.35)',
              }}>
                ⚽ Quero Ser Mestre do Placar!
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GAMIFICAÇÃO ── */}
      <section style={{ padding: '3.5rem 0', background: '#0D1B2A', color: 'white' }}>
        <div className="container">
          <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 }}>
            Evolua na plataforma
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 40, fontFamily: "'Bebas Neue'", letterSpacing: 1, marginBottom: '0.5rem' }}>
            Suba de Nível
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem', fontSize: 15 }}>
            Cada acerto conta — conquiste sua posição no ranking!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
            {[
              { icon: '🥉', name: 'Bronze', range: '0–10 acertos', color: '#cd7f32', bg: 'rgba(205,127,50,0.08)' },
              { icon: '🥈', name: 'Prata', range: '11–30 acertos', color: '#aaa', bg: 'rgba(180,180,180,0.08)' },
              { icon: '🥇', name: 'Ouro', range: '31–100 acertos', color: '#FFB800', bg: 'rgba(255,184,0,0.08)' },
              { icon: '👑', name: 'Lenda', range: '101+ acertos', color: '#00C16A', bg: 'rgba(0,193,106,0.08)' },
            ].map(l => (
              <div key={l.name} style={{
                background: l.bg,
                border: `1px solid ${l.color}22`,
                borderRadius: 16, padding: '1.5rem 1rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{l.icon}</div>
                <div style={{ color: l.color, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{l.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{l.range}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÚLTIMOS GANHADORES ── */}
      {ganhadores.length > 0 && (
        <section style={{ padding: '4rem 0', background: '#f8fafb' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                  Prêmios pagos via PIX
                </p>
                <h2 style={{ fontSize: 38, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>🏆 Últimos Ganhadores</h2>
              </div>
              <Link to="/ganhadores">
                <button style={{
                  background: 'transparent', border: '1px solid #ddd', color: '#555',
                  borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  Ver todos →
                </button>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
              {ganhadores.map((g, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #fffbeb, #fff)',
                  borderRadius: 14, padding: '1.2rem',
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
                      <div style={{ fontSize: 11, color: '#888' }}>{g.tipo}</div>
                    </div>
                  </div>
                  <div style={{ background: 'white', borderRadius: 10, padding: '10px', textAlign: 'center', border: '1px solid #f0e0a0' }}>
                    <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>Prêmio recebido via PIX</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#FFB800' }}>
                      R$ {g.valor_premio?.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0D1B2A', color: 'white', padding: '3.5rem 0 2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 1.5 }}>
                  Mestre do <span style={{ color: '#FFB800' }}>Placar</span>
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Concurso de habilidade esportiva. Acerte os placares de 5 jogos e ganhe via PIX.
              </p>
            </div>
            <div>
              <h5 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Links</h5>
              {[['⚽ Rodadas', '/mestre'], ['📊 Ranking', '/ranking'], ['🏆 Ganhadores', '/ganhadores'], ['👤 Perfil', '/perfil']].map(([label, to]) => (
                <div key={to}>
                  <Link to={to} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, display: 'block', marginBottom: 8 }}>
                    {label}
                  </Link>
                </div>
              ))}
            </div>
            <div>
              <h5 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Suporte</h5>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                Dúvidas? Fale conosco pelo WhatsApp.
              </p>
              <p style={{ fontSize: 13, color: '#00C16A', fontWeight: 600, marginTop: 8 }}>
                Pago via PIX ✅
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '1rem',
              fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', lineHeight: 1.7,
            }}>
              <strong style={{ color: 'rgba(255,255,255,0.45)' }}>Concurso de habilidade esportiva.</strong>{' '}
              A participação consiste na escolha de placares com base em conhecimento esportivo, não caracterizando jogo de azar, rifa ou sorteio nos termos da legislação vigente.
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
              © 2026 Mestre do Placar. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
