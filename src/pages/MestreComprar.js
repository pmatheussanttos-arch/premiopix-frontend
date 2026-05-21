import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PixModal from '../components/PixModal';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const css = `
.mc-layout { display: grid; grid-template-columns: 1fr 240px; gap: 1.5rem; align-items: start; }
.mc-resumo  { position: sticky; top: 80px; min-width: 220px; }
.mc-picker-row { display: flex; align-items: center; gap: 12px; }

@media (max-width: 700px) {
  .mc-layout { grid-template-columns: 1fr; }
  .mc-resumo  { position: static; min-width: unset; order: -1; }
  .mc-picker-row { gap: 8px; }
}
`;

function GoalPicker({ label, value, onChange }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #e0e0e0', background: 'white', fontSize: 20, cursor: 'pointer', fontWeight: 700, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          −
        </button>
        <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #0D1B2A, #1a3050)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", fontSize: 34, color: 'white', letterSpacing: 1, boxShadow: '0 3px 12px rgba(13,27,42,0.3)', flexShrink: 0 }}>
          {value}
        </div>
        <button
          onClick={() => onChange(value + 1)}
          style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #FFB800', background: '#FFB800', fontSize: 20, cursor: 'pointer', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(255,184,0,0.35)', flexShrink: 0 }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function MestreComprar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [desafio, setDesafio] = useState(null);
  const [palpites, setPalpites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pagamento, setPagamento] = useState(null);

  useEffect(() => {
    axios.get(`${API}/mestre/publico/desafio/${id}`)
      .then(r => {
        setDesafio(r.data);
        setPalpites(r.data.jogos.map(j => ({ jogo_id: j.id, gols_casa: 0, gols_fora: 0 })));
      })
      .catch(() => navigate('/mestre'))
      .finally(() => setLoading(false));
  }, [id]);

  const comprar = async () => {
    setError(''); setSubmitting(true);
    try {
      const r = await axios.post(`${API}/mestre/comprar`, { desafio_id: parseInt(id), palpites });
      setPagamento(r.data.pagamento);
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao registrar cartela. Faça login e tente novamente.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  if (!desafio) return null;

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh', padding: '1.5rem 0 4rem' }}>
      <style>{css}</style>
      <div className="container" style={{ maxWidth: 780 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 14, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, minHeight: 44, padding: '0 4px' }}
        >
          ← Voltar para rodadas
        </button>

        {/* Header do desafio */}
        <div style={{ background: 'linear-gradient(135deg, #0D1B2A, #1a3050)', borderRadius: 20, padding: '1.25rem', marginBottom: '1.25rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                ⚽ {desafio.campeonato || 'Futebol'} · {desafio.jogos?.length} jogos
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>{desafio.titulo}</h1>
            </div>
            <div style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 14, padding: '10px 16px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>🏆 Jackpot</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: '#FFB800', letterSpacing: 1, lineHeight: 1 }}>
                R$ {desafio.valor_premio?.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        <div className="mc-layout">
          {/* Jogos */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: '1rem' }}>
              🎯 Preencha os placares de todos os {desafio.jogos?.length} jogos:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {desafio.jogos?.map((j, i) => (
                <div key={j.id} style={{ background: 'white', borderRadius: 16, padding: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Número */}
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0D1B2A', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", fontSize: 14, color: '#FFB800' }}>
                      {i + 1}
                    </div>

                    {/* Info do jogo */}
                    <div style={{ flex: 1, minWidth: 100 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 2 }}>
                        {j.time_casa} <span style={{ color: '#ccc' }}>×</span> {j.time_fora}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>
                        📅 {new Date(j.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Pickers */}
                    <div className="mc-picker-row">
                      <GoalPicker
                        label={j.time_casa.length > 8 ? j.time_casa.slice(0, 8) : j.time_casa}
                        value={palpites[i]?.gols_casa ?? 0}
                        onChange={v => {
                          const n = [...palpites];
                          n[i] = { ...n[i], gols_casa: v };
                          setPalpites(n);
                        }}
                      />
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: '#ccc', paddingTop: 16 }}>×</div>
                      <GoalPicker
                        label={j.time_fora.length > 8 ? j.time_fora.slice(0, 8) : j.time_fora}
                        value={palpites[i]?.gols_fora ?? 0}
                        onChange={v => {
                          const n = [...palpites];
                          n[i] = { ...n[i], gols_fora: v };
                          setPalpites(n);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div className="mc-resumo">
            <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.09)', overflow: 'hidden' }}>
              <div style={{ background: '#0D1B2A', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Seus palpites</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{desafio.jogos?.length} jogos</div>
              </div>

              <div style={{ padding: '1rem' }}>
                {palpites.map((p, i) => {
                  const j = desafio.jogos?.[i];
                  if (!j) return null;
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '5px 0', borderBottom: i < palpites.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                      <span style={{ color: '#888', flex: 1 }}>{i + 1}. {j.time_casa?.slice(0, 8)}</span>
                      <span style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: '#0D1B2A', letterSpacing: 0.5 }}>
                        {p.gols_casa} × {p.gols_fora}
                      </span>
                    </div>
                  );
                })}

                <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fff8d6)', borderRadius: 10, padding: '10px', textAlign: 'center', margin: '1rem 0', border: '1px solid #ffe082' }}>
                  <div style={{ fontSize: 10, color: '#92400e', marginBottom: 2, fontWeight: 600 }}>🏆 Jackpot</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: '#FFB800', letterSpacing: 1 }}>
                    R$ {desafio.valor_premio?.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                  <span style={{ color: '#888' }}>Valor da cartela</span>
                  <strong style={{ color: '#00C16A', fontSize: 15 }}>R$ {desafio.valor_cartela?.toFixed(2)}</strong>
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 12px', color: '#dc2626', fontSize: 12, marginBottom: '0.75rem' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={comprar}
                  disabled={submitting}
                  style={{ width: '100%', background: submitting ? '#aaa' : 'linear-gradient(135deg, #00C16A, #00a857)', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 4px 16px rgba(0,193,106,0.35)', letterSpacing: 0.3, minHeight: 48 }}
                >
                  {submitting ? '⏳ Gerando PIX...' : `✅ Pagar R$ ${desafio.valor_cartela?.toFixed(2)} via PIX`}
                </button>

                <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 8 }}>
                  🔒 Pagamento seguro via PIX
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pagamento && (
        <PixModal
          pagamento={pagamento}
          onClose={() => setPagamento(null)}
          onConfirmed={() => { setPagamento(null); navigate('/perfil'); }}
        />
      )}
    </div>
  );
}
