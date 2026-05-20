import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

export function PlacarPremiado() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/jogos/publico`)
      .then(r => setJogos(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #071a2e, #0d2d4a)',
        color: 'white',
        padding: '3rem 0 2.5rem',
      }}>
        <div className="container">
          <p style={{ color: '#00C16A', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Apostas disponíveis
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 52, letterSpacing: 2, marginBottom: '0.5rem' }}>
            ⚽ Placar Premiado
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16 }}>
            Acerte o Placar, Ganhe o PIX! — Escolha o jogo e aposte no placar exato.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 0' }}>
        {jogos.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: '4rem 2rem',
            textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 64, marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ fontSize: 22, marginBottom: '0.5rem', color: '#111' }}>Nenhum jogo disponível agora</h3>
            <p style={{ color: '#888' }}>Aguarde novos jogos serem adicionados. Volte em breve!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {jogos.map(j => (
              <JogoCard key={j.id} jogo={j} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JogoCard({ jogo: j }) {
  const [hovered, setHovered] = useState(false);
  const dataStr = new Date(j.data_hora).toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{
      background: 'white',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.13)' : '0 2px 16px rgba(0,0,0,0.07)',
      transform: hovered ? 'translateY(-5px)' : 'none',
      transition: 'all 0.25s ease',
      cursor: 'pointer',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Topo colorido */}
      <div style={{
        background: 'linear-gradient(135deg, #00C16A, #00a857)',
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {j.campeonato}
        </span>
        <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 20, fontSize: 11, padding: '3px 10px', fontWeight: 600 }}>
          ● AO VIVO
        </span>
      </div>

      <div style={{ padding: '1.2rem' }}>
        {/* Times */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 8 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🏠</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{j.time_casa}</div>
          </div>
          <div style={{
            background: '#f0f9f4',
            borderRadius: 12,
            padding: '8px 14px',
            textAlign: 'center',
            border: '2px solid #e0f5ea',
          }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: '#00C16A', letterSpacing: 1 }}>VS</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>✈️</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{j.time_fora}</div>
          </div>
        </div>

        {/* Prêmio */}
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fff8d6)',
          borderRadius: 12,
          padding: '12px',
          textAlign: 'center',
          marginBottom: 14,
          border: '1px solid #ffe082',
        }}>
          <div style={{ fontSize: 11, color: '#92400e', marginBottom: 2, fontWeight: 600 }}>💰 PRÊMIO DO JOGO</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: '#FFB800', letterSpacing: 1 }}>
            R$ {j.premio_fixo?.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: 11, color: '#92400e' }}>dividido entre quem acertar</div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 16 }}>
          <span>📅 {dataStr}</span>
          <span>👥 {j.total_apostas || 0} apostas</span>
        </div>

        {/* CTA */}
        <Link to={`/placar/${j.id}`}>
          <button style={{
            width: '100%',
            background: hovered ? '#00a857' : '#00C16A',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '12px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.2s',
            letterSpacing: 0.3,
          }}>
            🎯 Apostar — R$ {j.valor_palpite?.toFixed(2)}
          </button>
        </Link>
      </div>
    </div>
  );
}
