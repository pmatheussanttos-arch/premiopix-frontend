import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PixModal from '../components/PixModal';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

function GoalPicker({ label, value, onChange }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{
            width: 44, height: 44, borderRadius: 12,
            border: '2px solid #e0e0e0', background: 'white',
            fontSize: 22, cursor: 'pointer', fontWeight: 700, color: '#555',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#00C16A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
        >
          −
        </button>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, #071a2e, #0d2d4a)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue'", fontSize: 42, color: 'white',
          letterSpacing: 1,
          boxShadow: '0 4px 16px rgba(7,26,46,0.25)',
        }}>
          {value}
        </div>
        <button
          onClick={() => onChange(value + 1)}
          style={{
            width: 44, height: 44, borderRadius: 12,
            border: '2px solid #e0e0e0', background: '#00C16A',
            fontSize: 22, cursor: 'pointer', fontWeight: 700, color: 'white',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,193,106,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#00a857'}
          onMouseLeave={e => e.currentTarget.style.background = '#00C16A'}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PlacarDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jogo, setJogo] = useState(null);
  const [goalsCasa, setGoalsCasa] = useState(0);
  const [goalsFora, setGoalsFora] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pagamento, setPagamento] = useState(null);

  useEffect(() => {
    axios.get(`${API}/jogos/publico/${id}`)
      .then(r => setJogo(r.data))
      .catch(() => navigate('/placar-premiado'))
      .finally(() => setLoading(false));
  }, [id]);

  const apostar = async () => {
    setError(''); setSubmitting(true);
    try {
      const r = await axios.post(`${API}/palpites/criar`, {
        jogo_id: parseInt(id),
        gols_casa: goalsCasa,
        gols_fora: goalsFora,
      });
      setPagamento(r.data.pagamento);
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao registrar aposta. Faça login e tente novamente.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  if (!jogo) return null;

  const dataStr = new Date(jogo.data_hora).toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh', padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#666', fontSize: 14, marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500,
          }}
        >
          ← Voltar para jogos
        </button>

        {/* Card principal */}
        <div style={{
          background: 'white', borderRadius: 24,
          boxShadow: '0 4px 30px rgba(0,0,0,0.10)',
          overflow: 'hidden',
        }}>
          {/* Header do card */}
          <div style={{
            background: 'linear-gradient(135deg, #071a2e, #0d2d4a)',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'white',
          }}>
            <div style={{
              display: 'inline-block', background: 'rgba(0,193,106,0.2)',
              border: '1px solid rgba(0,193,106,0.5)',
              borderRadius: 20, padding: '4px 14px', fontSize: 12,
              color: '#00C16A', fontWeight: 700, marginBottom: 12, letterSpacing: 0.5,
            }}>
              ⚽ {jogo.campeonato}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'white' }}>
              {jogo.time_casa} <span style={{ color: '#FFB800' }}>×</span> {jogo.time_fora}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>📅 {dataStr}</p>
          </div>

          <div style={{ padding: '1.75rem' }}>
            {/* Prêmio */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb, #fff8d6)',
              borderRadius: 14, padding: '1.2rem', textAlign: 'center',
              marginBottom: '1.75rem', border: '1px solid #ffe082',
            }}>
              <div style={{ fontSize: 12, color: '#92400e', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                💰 Prêmio do Jogo
              </div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, color: '#FFB800', letterSpacing: 2, lineHeight: 1 }}>
                R$ {jogo.premio_fixo?.toLocaleString('pt-BR')}
              </div>
              <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>
                Dividido igualmente entre todos que acertarem
              </div>
            </div>

            {/* Seletor de placar */}
            <div style={{ marginBottom: '1.75rem' }}>
              <p style={{ fontWeight: 700, textAlign: 'center', marginBottom: '1.25rem', fontSize: 15, color: '#111' }}>
                🎯 Qual será o placar final?
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <GoalPicker label={jogo.time_casa} value={goalsCasa} onChange={setGoalsCasa} />

                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: '#ccc' }}>×</div>
                </div>

                <GoalPicker label={jogo.time_fora} value={goalsFora} onChange={setGoalsFora} />
              </div>
            </div>

            {/* Preview do palpite */}
            <div style={{
              background: '#f0f9f4', borderRadius: 12, padding: '14px 18px',
              marginBottom: 10, border: '1px solid #c6edd9',
              display: 'flex', justifyContent: 'space-between', fontSize: 14,
            }}>
              <span style={{ color: '#555' }}>Seu palpite</span>
              <strong style={{ color: '#00C16A', fontSize: 16, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>
                {jogo.time_casa} {goalsCasa} × {goalsFora} {jogo.time_fora}
              </strong>
            </div>

            <div style={{
              background: '#f8fafb', borderRadius: 12, padding: '14px 18px',
              marginBottom: '1.5rem', border: '1px solid #eee',
              display: 'flex', justifyContent: 'space-between', fontSize: 14,
            }}>
              <span style={{ color: '#555' }}>Valor a pagar</span>
              <strong style={{ color: '#00C16A', fontSize: 17, fontWeight: 800 }}>
                R$ {jogo.valor_palpite?.toFixed(2)}
              </strong>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
                padding: '12px 16px', color: '#dc2626', fontSize: 14,
                marginBottom: '1rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={apostar}
              disabled={submitting}
              style={{
                width: '100%',
                background: submitting ? '#aaa' : '#00C16A',
                color: 'white', border: 'none', borderRadius: 14,
                padding: '16px', fontSize: 16, fontWeight: 800,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: submitting ? 'none' : '0 4px 20px rgba(0,193,106,0.35)',
                transition: 'all 0.2s',
                letterSpacing: 0.3,
              }}
            >
              {submitting ? '⏳ Gerando PIX...' : `✅ Confirmar e Pagar R$ ${jogo.valor_palpite?.toFixed(2)} via PIX`}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 12 }}>
              🔒 Pagamento 100% seguro via PIX
            </p>
          </div>
        </div>
      </div>

      {pagamento && (
        <PixModal
          pagamento={pagamento}
          onClose={() => setPagamento(null)}
          onConfirmed={() => { setPagamento(null); navigate('/meus-jogos'); }}
        />
      )}
    </div>
  );
}
