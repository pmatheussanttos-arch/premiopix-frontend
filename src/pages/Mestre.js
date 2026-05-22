import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const css = `
.mestre-header { padding: 2.5rem 0 2rem; }
.mestre-title  { font-size: clamp(32px, 7vw, 52px); }
.mestre-grid   { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 20px; }

@media (max-width: 600px) {
  .mestre-header { padding: 1.75rem 0 1.5rem; }
  .mestre-grid   { grid-template-columns: 1fr; gap: 14px; }
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
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[['h', time.h], ['m', time.m], ['s', time.s]].map(([label, val]) => (
        <React.Fragment key={label}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '4px 10px', minWidth: 38, fontFamily: "'Bebas Neue'", fontSize: 20, color: '#FFB800', letterSpacing: 1 }}>
              {pad(val)}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 }}>{label}</div>
          </div>
          {label !== 's' && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16, marginBottom: 10 }}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Mestre() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/mestre/publico/jogos`)
      .then(r => setDesafios(r.data))
      .catch(() => setDesafios([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh' }}>
      <style>{css}</style>
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A, #1a3050)', color: 'white' }}>
        <div className="container mestre-header">
          <p style={{ color: '#FFB800', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            Concurso de habilidade esportiva
          </p>
          <h1 className="mestre-title" style={{ fontFamily: "'Bebas Neue'", letterSpacing: 2, marginBottom: '0.25rem' }}>
            ⚽ Rodadas Abertas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            Acerte os placares de 5 jogos e concorra ao Bolsão Pix — pague via PIX, ganhe via PIX!
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {desafios.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, padding: '3.5rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ fontSize: 20, color: '#111', marginBottom: '0.5rem' }}>Nenhuma rodada disponível agora</h3>
            <p style={{ color: '#888', fontSize: 14 }}>Aguarde novas rodadas serem abertas. Volte em breve!</p>
          </div>
        ) : (
          <div className="mestre-grid">
            {desafios.map(d => <RodadaCard key={d.id} desafio={d} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function RodadaCard({ desafio: d }) {
  const nextGame = d.jogos?.[0]?.data_hora;

  return (
    <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', cursor: 'pointer' }}>
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A, #1a3050)', padding: '1.1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              {d.campeonato || 'Futebol'}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'white', lineHeight: 1.2 }}>{d.titulo}</div>
          </div>
          <span style={{ background: 'rgba(0,193,106,0.15)', color: '#00C16A', border: '1px solid rgba(0,193,106,0.3)', borderRadius: 20, fontSize: 10, padding: '3px 10px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
            ● ABERTO
          </span>
        </div>

        {nextGame && (
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Inicia em</div>
            <Countdown targetDate={nextGame} />
          </div>
        )}
      </div>

      <div style={{ padding: '1.1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fff8d6)', borderRadius: 14, padding: '12px', textAlign: 'center', marginBottom: 12, border: '1px solid #ffe082' }}>
          <div style={{ fontSize: 10, color: '#92400e', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>🏆 Bolsão Pix da Rodada</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, color: '#FFB800', letterSpacing: 2, lineHeight: 1 }}>
            R$ {d.valor_premio?.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: 10, color: '#92400e', marginTop: 2 }}>dividido entre quem acertar todos os placares</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {d.jogos?.length || 0} jogos desta rodada
          </div>
          {d.jogos?.map((j, i) => (
            <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555', padding: '5px 0', borderBottom: i < d.jogos.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
              <span style={{ color: '#FFB800', fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
              <span style={{ flex: 1 }}>{j.time_casa} <span style={{ color: '#ccc' }}>×</span> {j.time_fora}</span>
              <span style={{ color: '#aaa', fontSize: 10, flexShrink: 0 }}>
                {new Date(j.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#888', marginBottom: 12 }}>
          <span>👥 {d.participantes || 0} participantes</span>
          <span>💳 R$ {d.valor_cartela?.toFixed(2)} por cartela</span>
        </div>

        <Link to={`/mestre/comprar/${d.id}`} style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', background: 'linear-gradient(135deg, #00C16A, #00a857)', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3, minHeight: 48 }}>
            🎯 Participar — R$ {d.valor_cartela?.toFixed(2)}
          </button>
        </Link>
      </div>
    </div>
  );
}
