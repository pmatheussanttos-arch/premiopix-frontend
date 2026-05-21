import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PixModal from '../components/PixModal';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const css = `
.picker-btn-sub { width: 52px; height: 52px; border-radius: 14px; border: 2px solid #e0e0e0; background: white; font-size: 26px; cursor: pointer; font-weight: 700; color: #555; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s; }
.picker-btn-add { width: 52px; height: 52px; border-radius: 14px; border: 2px solid #e0e0e0; background: #00C16A; font-size: 26px; cursor: pointer; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,193,106,0.3); }
.picker-score   { width: 72px; height: 72px; background: linear-gradient(135deg, #071a2e, #0d2d4a); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue'; font-size: 48px; color: white; letter-spacing: 1; box-shadow: 0 4px 16px rgba(7,26,46,0.25); flex-shrink: 0; }

@media (max-width: 480px) {
  .picker-btn-sub { width: 56px; height: 56px; }
  .picker-btn-add { width: 56px; height: 56px; }
  .picker-score   { width: 68px; height: 68px; font-size: 42px; }
}
`;

function GoalPicker({ label, value, onChange }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
        <button
          className="picker-btn-sub"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <div className="picker-score">{value}</div>
        <button
          className="picker-btn-add"
          onClick={() => onChange(value + 1)}
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
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh', padding: '1.5rem 0 4rem' }}>
      <style>{css}</style>
      <div className="container" style={{ maxWidth: 520 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 14, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, minHeight: 44, padding: '0 4px' }}
        >
          ← Voltar para jogos
        </button>

        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 4px 30px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #071a2e, #0d2d4a)', padding: '1.5rem 1.25rem', textAlign: 'center', color: 'white' }}>
            <div style={{ display: 'inline-block', background: 'rgba(0,193,106,0.2)', border: '1px solid rgba(0,193,106,0.5)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#00C16A', fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>
              ⚽ {jogo.campeonato}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'white', lineHeight: 1.2 }}>
              {jogo.time_casa} <span style={{ color: '#FFB800' }}>×</span> {jogo.time_fora}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>📅 {dataStr}</p>
          </div>

          <div style={{ padding: '1.5rem 1.25rem' }}>
            {/* Prêmio */}
            <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fff8d6)', borderRadius: 14, padding: '1.1rem', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid #ffe082' }}>
              <div style={{ fontSize: 12, color: '#92400e', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                💰 Prêmio do Jogo
              </div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 40, color: '#FFB800', letterSpacing: 2, lineHeight: 1 }}>
                R$ {jogo.premio_fixo?.toLocaleString('pt-BR')}
              </div>
              <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>Dividido entre todos que acertarem</div>
            </div>

            {/* Seletor de placar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 700, textAlign: 'center', marginBottom: '1.25rem', fontSize: 15, color: '#111' }}>
                🎯 Qual será o placar final?
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
                <GoalPicker label={jogo.time_casa} value={goalsCasa} onChange={setGoalsCasa} />
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#ccc' }}>×</div>
                <GoalPicker label={jogo.time_fora} value={goalsFora} onChange={setGoalsFora} />
              </div>
            </div>

            {/* Preview */}
            <div style={{ background: '#f0f9f4', borderRadius: 12, padding: '13px 16px', marginBottom: 10, border: '1px solid #c6edd9', display: 'flex', justifyContent: 'space-between', fontSize: 14, alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ color: '#555' }}>Seu palpite</span>
              <strong style={{ color: '#00C16A', fontSize: 15, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>
                {jogo.time_casa} {goalsCasa} × {goalsFora} {jogo.time_fora}
              </strong>
            </div>

            <div style={{ background: '#f8fafb', borderRadius: 12, padding: '13px 16px', marginBottom: '1.25rem', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontSize: 14, alignItems: 'center' }}>
              <span style={{ color: '#555' }}>Valor a pagar</span>
              <strong style={{ color: '#00C16A', fontSize: 16, fontWeight: 800 }}>R$ {jogo.valor_palpite?.toFixed(2)}</strong>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 14, marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={apostar}
              disabled={submitting}
              style={{ width: '100%', background: submitting ? '#aaa' : '#00C16A', color: 'white', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 4px 20px rgba(0,193,106,0.35)', transition: 'all 0.2s', letterSpacing: 0.3, minHeight: 52 }}
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
