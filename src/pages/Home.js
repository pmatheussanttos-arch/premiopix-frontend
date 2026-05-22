import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const css = `
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
@keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes spin     { to{transform:rotate(360deg)} }

.hero-section { padding: 5rem 0 4rem; }
.hero-title   { font-size: clamp(38px,9vw,82px); }
.hero-sub     { font-size: 17px; }
.jackpot-box  { padding: 1.2rem 2.5rem; }
.jackpot-val  { font-size: 52px; }
.hero-btn     { padding: 15px 36px; font-size: 17px; }
.stats-bar    { display: flex; flex-wrap: wrap; justify-content: center; }
.stats-bar-item { padding: 1rem 2.5rem; text-align: center; border-right: 1px solid rgba(255,255,255,0.2); }
.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
.jogos-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 18px; }
.como-grid  { display: grid; grid-template-columns: repeat(auto-fit,minmax(210px,1fr)); gap: 24px; }
.nivel-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 12px; }
.footer-grid{ display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 2.5rem; }

@media (max-width: 600px) {
  .hero-section { padding: 3rem 0 2.5rem; }
  .hero-sub     { font-size: 15px; }
  .jackpot-box  { padding: 1rem 1.5rem; }
  .jackpot-val  { font-size: 40px; }
  .hero-btn     { padding: 13px 24px; font-size: 15px; width: 100%; text-align: center; }
  .hero-buttons { flex-direction: column; align-items: stretch; gap: 10px !important; }
  .hero-buttons a, .hero-buttons button { width: 100%; }
  .stats-bar-item { padding: 0.75rem 1.25rem; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.12); width: 50%; }
  .stats-bar-item:nth-child(2n) { border-right: none; }
  .stats-bar-item:nth-child(odd):not(:last-child) { border-right: 1px solid rgba(255,255,255,0.12); }
  .section-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .jogos-grid { grid-template-columns: 1fr; }
  .como-grid  { grid-template-columns: 1fr; }
  .nivel-grid { grid-template-columns: 1fr 1fr; }
  .footer-grid{ grid-template-columns: 1fr; gap: 1.5rem; }
  .float-emoji { display: none; }
}
`;

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate) - Date.now());
      setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {[['h', time.h], ['m', time.m], ['s', time.s]].map(([l, v]) => (
        <div key={l} style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', minWidth: 44, fontFamily: "'Bebas Neue'", fontSize: 26, color: '#FFB800', letterSpacing: 2 }}>{pad(v)}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [jogos, setJogos] = useState([]);
  const [rodadas, setRodadas] = useState([]);
  const [ganhadores, setGanhadores] = useState([]);
  const [status, setStatus] = useState('loading');
  const [tentativa, setTentativa] = useState(0);

  const carregar = useCallback(() => {
    setStatus('loading');
    Promise.all([
      axios.get(`${API}/jogos/publico`, { timeout: 20000 }),
      axios.get(`${API}/mestre/publico/jogos`, { timeout: 20000 }),
      axios.get(`${API}/ganhadores/`, { timeout: 20000 }).catch(() => ({ data: [] })),
    ])
      .then(([j, r, g]) => {
        const j2 = Array.isArray(j.data) ? j.data.slice(0, 6) : [];
        const r2 = Array.isArray(r.data) ? r.data.slice(0, 3) : [];
        setJogos(j2);
        setRodadas(r2);
        setGanhadores(Array.isArray(g.data) ? g.data.slice(0, 4) : []);
        setStatus(j2.length > 0 || r2.length > 0 ? 'ok' : 'vazio');
      })
      .catch(() => setStatus('erro'));
  }, [tentativa]);

  useEffect(() => { carregar(); }, [carregar]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <style>{css}</style>
        <div style={{ width: 48, height: 48, border: '4px solid rgba(255,184,0,0.2)', borderTopColor: '#FFB800', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>Carregando jogos...</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>O servidor pode levar até 30s para acordar</div>
      </div>
    );
  }

  if (status === 'erro') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '2rem 1rem' }}>
        <style>{css}</style>
        <div style={{ fontSize: 56 }}>⚙️</div>
        <h2 style={{ color: 'white', fontFamily: "'Bebas Neue'", fontSize: 34, letterSpacing: 2, margin: 0, textAlign: 'center' }}>Servidor Acordando</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', maxWidth: 300, lineHeight: 1.7, margin: 0 }}>
          O servidor está iniciando (até 60s). Clique em tentar novamente.
        </p>
        <button
          onClick={() => setTentativa(t => t + 1)}
          style={{ background: '#00C16A', color: 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,193,106,0.4)', minHeight: 48 }}
        >
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  const temJogos   = jogos.length > 0;
  const temRodadas = rodadas.length > 0;
  const jackpot    = rodadas[0]?.valor_premio || 0;
  const nextGame   = jogos[0]?.data_hora || rodadas[0]?.jogos?.[0]?.data_hora;

  return (
    <div>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ background: 'linear-gradient(135deg,#0D1B2A 0%,#1a3050 50%,#0D1B2A 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
        <div className="float-emoji" style={{ position: 'absolute', top: '8%', left: '4%', fontSize: 90, opacity: 0.05, animation: 'float 4s ease-in-out infinite' }}>⚽</div>
        <div className="float-emoji" style={{ position: 'absolute', top: '15%', right: '5%', fontSize: 70, opacity: 0.06, animation: 'float 5s ease-in-out infinite 1s' }}>🏆</div>
        <div className="float-emoji" style={{ position: 'absolute', bottom: '10%', left: '8%', fontSize: 55, opacity: 0.05, animation: 'float 6s ease-in-out infinite 0.5s' }}>💰</div>

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)', borderRadius: 20, padding: '6px 18px', fontSize: 12, color: '#FFB800', fontWeight: 700, marginBottom: '1.25rem', animation: 'fadeInUp 0.6s ease' }}>
            👑 Concurso de habilidade esportiva
          </div>
          <h1 className="hero-title" style={{ lineHeight: 1.0, marginBottom: '0.75rem', fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 3, animation: 'fadeInUp 0.7s ease' }}>
            Mestre do<br />
            <span style={{ background: 'linear-gradient(90deg,#FFB800,#ff8f00,#FFB800)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>Placar</span>
          </h1>
          <p className="hero-sub" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto 1.75rem', lineHeight: 1.65, animation: 'fadeInUp 0.8s ease' }}>
            Acerte o placar, pague via PIX e <strong style={{ color: 'white' }}>ganhe via PIX</strong>. Simples e seguro!
          </p>

          {(jackpot > 0 || nextGame) && (
            <div className="jackpot-box" style={{ display: 'inline-block', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 20, marginBottom: '1.75rem', animation: 'fadeInUp 0.85s ease' }}>
              {jackpot > 0 && (
                <>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>🏆 Bolsão Pix disponível</div>
                  <div className="jackpot-val" style={{ fontFamily: "'Bebas Neue'", letterSpacing: 2, background: 'linear-gradient(90deg,#FFB800,#ff8f00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'pulse 2s ease-in-out infinite' }}>
                    R$ {jackpot.toLocaleString('pt-BR')}
                  </div>
                </>
              )}
              {nextGame && (
                <>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, marginTop: jackpot > 0 ? 8 : 0 }}>Começa em</div>
                  <Countdown targetDate={nextGame} />
                </>
              )}
            </div>
          )}

          <div className="hero-buttons" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.95s ease' }}>
            {temJogos ? (
              <Link to="/placar-premiado" style={{ textDecoration: 'none' }}>
                <button className="hero-btn" style={{ background: 'linear-gradient(135deg,#00C16A,#00a857)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,193,106,0.45)', animation: 'pulse 2.5s ease-in-out infinite', letterSpacing: 0.3, minHeight: 48 }}>
                  ⚽ Apostar Agora
                </button>
              </Link>
            ) : temRodadas ? (
              <Link to="/mestre" style={{ textDecoration: 'none' }}>
                <button className="hero-btn" style={{ background: 'linear-gradient(135deg,#00C16A,#00a857)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,193,106,0.45)', animation: 'pulse 2.5s ease-in-out infinite', letterSpacing: 0.3, minHeight: 48 }}>
                  🏆 Ver Rodadas
                </button>
              </Link>
            ) : null}
            <Link to="/ganhadores" style={{ textDecoration: 'none' }}>
              <button className="hero-btn" style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 14, fontWeight: 600, cursor: 'pointer', minHeight: 48 }}>
                🏆 Ganhadores
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ background: '#00C16A', color: 'white' }}>
        <div className="container stats-bar">
          {[['👑','Mestres do Placar','2.400+'],['💰','Prêmios Pagos','R$ 48.900+'],['⚽','Apostas Realizadas','3.820+'],['✅','Pagamentos no Prazo','100%']].map(([icon,label,val]) => (
            <div key={label} className="stats-bar-item">
              <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 1 }}>{val}</div>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── JOGOS INDIVIDUAIS ── */}
      {temJogos && (
        <section style={{ padding: '3rem 0', background: '#f8fafb' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <p style={{ color: '#00C16A', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Apostas abertas agora</p>
                <h2 style={{ fontSize: 34, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>⚽ Jogos Disponíveis</h2>
              </div>
              <Link to="/placar-premiado"><button style={{ background: 'transparent', border: '1px solid #ddd', color: '#555', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 36 }}>Ver todos →</button></Link>
            </div>
            <div className="jogos-grid">
              {jogos.map(j => <JogoCard key={j.id} jogo={j} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── RODADAS MESTRE ── */}
      {temRodadas && (
        <section style={{ padding: '3rem 0', background: temJogos ? 'white' : '#f8fafb' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Acerte os 5 placares</p>
                <h2 style={{ fontSize: 34, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>🏆 Rodadas com Bolsão Pix</h2>
              </div>
              <Link to="/mestre"><button style={{ background: 'transparent', border: '1px solid #ddd', color: '#555', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 36 }}>Ver todas →</button></Link>
            </div>
            <div className="jogos-grid">
              {rodadas.map(d => <RodadaCard key={d.id} desafio={d} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── VAZIO ── */}
      {status === 'vazio' && (
        <section style={{ padding: '3rem 0', background: '#f8fafb' }}>
          <div className="container">
            <div style={{ background: 'white', borderRadius: 20, padding: '4rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 56, marginBottom: '1rem' }}>⏳</div>
              <h3 style={{ fontSize: 20, color: '#111', marginBottom: '0.5rem' }}>Nenhum jogo disponível agora</h3>
              <p style={{ color: '#888', fontSize: 14 }}>Aguarde novos jogos serem adicionados. Volte em breve!</p>
            </div>
          </div>
        </section>
      )}

      {/* ── COMO FUNCIONA ── */}
      <section style={{ padding: '3.5rem 0', background: 'white' }}>
        <div className="container">
          <p style={{ color: '#00C16A', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 }}>É simples assim</p>
          <h2 style={{ textAlign: 'center', fontSize: 38, fontFamily: "'Bebas Neue'", letterSpacing: 1, marginBottom: '0.5rem' }}>Como Funciona?</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '2.5rem', fontSize: 14 }}>Em 3 passos você está concorrendo ao prêmio</p>
          <div className="como-grid">
            {[
              { step: '01', icon: '⚽', title: 'Escolha o Jogo', desc: 'Selecione um jogo e escolha o placar exato que você acredita que vai acontecer.' },
              { step: '02', icon: '📱', title: 'Pague via PIX', desc: 'Pague instantaneamente via QR Code PIX. Rápido, seguro e sem cadastro de cartão.' },
              { step: '03', icon: '🏆', title: 'Receba o Prêmio', desc: 'Acertou o placar? O prêmio cai na sua chave PIX automaticamente!' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ textAlign: 'center', padding: '2.5rem 1.5rem 2rem', borderRadius: 18, background: '#f8fafb', position: 'relative', border: '1px solid #eee' }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#0D1B2A', color: '#FFB800', borderRadius: 20, padding: '3px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>PASSO {step}</div>
                <div style={{ fontSize: 48, marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: '0.75rem', color: '#111' }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to={temJogos ? '/placar-premiado' : '/mestre'} style={{ textDecoration: 'none' }}>
              <button style={{ background: 'linear-gradient(135deg,#00C16A,#00a857)', color: 'white', border: 'none', borderRadius: 14, padding: '14px 40px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,193,106,0.35)', minHeight: 48 }}>
                ⚽ Quero Apostar Agora!
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GAMIFICAÇÃO ── */}
      <section style={{ padding: '3rem 0', background: '#0D1B2A', color: 'white' }}>
        <div className="container">
          <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 }}>Evolua na plataforma</p>
          <h2 style={{ textAlign: 'center', fontSize: 36, fontFamily: "'Bebas Neue'", letterSpacing: 1, marginBottom: '2rem' }}>Suba de Nível</h2>
          <div className="nivel-grid">
            {[
              { icon: '🥉', name: 'Bronze', range: '0–10 acertos', color: '#cd7f32' },
              { icon: '🥈', name: 'Prata',  range: '11–30 acertos', color: '#aaa' },
              { icon: '🥇', name: 'Ouro',   range: '31–100 acertos', color: '#FFB800' },
              { icon: '👑', name: 'Lenda',  range: '101+ acertos', color: '#00C16A' },
            ].map(l => (
              <div key={l.name} style={{ background: `${l.color}10`, border: `1px solid ${l.color}22`, borderRadius: 14, padding: '1.25rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{l.icon}</div>
                <div style={{ color: l.color, fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{l.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{l.range}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GANHADORES ── */}
      {ganhadores.length > 0 && (
        <section style={{ padding: '3rem 0', background: '#f8fafb' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Prêmios pagos via PIX</p>
                <h2 style={{ fontSize: 34, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>🏆 Últimos Ganhadores</h2>
              </div>
              <Link to="/ganhadores"><button style={{ background: 'transparent', border: '1px solid #ddd', color: '#555', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 36 }}>Ver todos →</button></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
              {ganhadores.map((g, i) => (
                <div key={i} style={{ background: 'linear-gradient(135deg,#fffbeb,#fff)', borderRadius: 14, padding: '1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ffe082' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#FFB800,#ff8f00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏆</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{g.nome?.split(' ')[0]}***</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{g.tipo}</div>
                    </div>
                  </div>
                  <div style={{ background: 'white', borderRadius: 10, padding: '10px', textAlign: 'center', border: '1px solid #f0e0a0' }}>
                    <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>Prêmio via PIX</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: '#FFB800' }}>R$ {g.valor_premio?.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0D1B2A', color: 'white', padding: '3rem 0 2rem' }}>
        <div className="container">
          <div className="footer-grid" style={{ marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <span style={{ fontSize: 20 }}>🏆</span>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1.5 }}>Mestre do <span style={{ color: '#FFB800' }}>Placar</span></span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Concurso de habilidade esportiva. Acerte os placares e ganhe via PIX.</p>
            </div>
            <div>
              <h5 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Links</h5>
              {[['⚽ Jogos','/placar-premiado'],['🏆 Rodadas','/mestre'],['📊 Ranking','/ranking'],['👤 Perfil','/perfil']].map(([label,to]) => (
                <div key={to}><Link to={to} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, display: 'block', marginBottom: 8 }}>{label}</Link></div>
              ))}
            </div>
            <div>
              <h5 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Suporte</h5>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>Dúvidas? Fale conosco pelo WhatsApp.</p>
              <p style={{ fontSize: 13, color: '#00C16A', fontWeight: 600, marginTop: 8 }}>Pago via PIX ✅</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '1rem', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', lineHeight: 1.7 }}>
              <strong style={{ color: 'rgba(255,255,255,0.45)' }}>Concurso de habilidade esportiva.</strong>{' '}
              A participação consiste na escolha de placares com base em conhecimento esportivo, não caracterizando jogo de azar.
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 Mestre do Placar. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function JogoCard({ jogo: j }) {
  const dataStr = new Date(j.data_hora).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ background: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', cursor: 'pointer' }}>
      <div style={{ background: 'linear-gradient(135deg,#00C16A,#00a857)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{j.campeonato}</span>
        <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 20, fontSize: 10, padding: '2px 8px', fontWeight: 600 }}>● ABERTO</span>
      </div>
      <div style={{ padding: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            {j.logo_casa
              ? <img src={j.logo_casa} alt={j.time_casa} style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 4 }} />
              : <div style={{ fontSize: 26, marginBottom: 2 }}>🏠</div>}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{j.time_casa}</div>
          </div>
          <div style={{ background: '#f0f9f4', borderRadius: 10, padding: '6px 12px', textAlign: 'center', border: '2px solid #e0f5ea' }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: '#00C16A', letterSpacing: 1 }}>VS</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            {j.logo_fora
              ? <img src={j.logo_fora} alt={j.time_fora} style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 4 }} />
              : <div style={{ fontSize: 26, marginBottom: 2 }}>✈️</div>}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{j.time_fora}</div>
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fff8d6)', borderRadius: 10, padding: '10px', textAlign: 'center', marginBottom: 10, border: '1px solid #ffe082' }}>
          <div style={{ fontSize: 10, color: '#92400e', marginBottom: 1, fontWeight: 600 }}>💰 PRÊMIO</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: '#FFB800', letterSpacing: 1 }}>R$ {j.premio_fixo?.toLocaleString('pt-BR')}</div>
          <div style={{ fontSize: 10, color: '#92400e' }}>dividido entre quem acertar</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 12 }}>
          <span>📅 {dataStr}</span>
          <span>👥 {j.total_apostas || 0} apostas</span>
        </div>
        <Link to={`/placar/${j.id}`} style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', background: '#00C16A', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3, minHeight: 48 }}>
            🎯 Apostar — R$ {j.valor_palpite?.toFixed(2)}
          </button>
        </Link>
      </div>
    </div>
  );
}

function RodadaCard({ desafio: d }) {
  return (
    <div style={{ background: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', cursor: 'pointer', borderTop: '3px solid #FFB800' }}>
      <div style={{ padding: '1.1rem' }}>
        <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{d.campeonato}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 10 }}>{d.titulo}</div>
        <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fff8d6)', borderRadius: 10, padding: '10px', textAlign: 'center', marginBottom: 10, border: '1px solid #ffe082' }}>
          <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600, marginBottom: 1 }}>🏆 BOLSÃO PIX</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#FFB800', letterSpacing: 1 }}>R$ {d.valor_premio?.toLocaleString('pt-BR')}</div>
        </div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
          {d.jogos?.slice(0, 3).map((j, i) => <div key={j.id} style={{ padding: '2px 0' }}>{i + 1}. {j.time_casa} × {j.time_fora}</div>)}
          {d.jogos?.length > 3 && <div style={{ color: '#FFB800', fontWeight: 600 }}>+{d.jogos.length - 3} jogos...</div>}
        </div>
        <Link to={`/mestre/comprar/${d.id}`} style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', background: '#0D1B2A', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3, minHeight: 48 }}>
            🎯 Participar — R$ {d.valor_cartela?.toFixed(2)}
          </button>
        </Link>
      </div>
    </div>
  );
}
