import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PixModal from '../components/PixModal';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

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
        gols_fora: goalsFora
      });
      setPagamento(r.data.pagamento);
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao registrar aposta');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  if (!jogo) return null;

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="container" style={{maxWidth:560}}>
        <button onClick={() => navigate(-1)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',fontSize:14,marginBottom:'1.5rem'}}>← Voltar</button>
        <div className="card">
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <div className="badge badge-green" style={{marginBottom:10}}>{jogo.campeonato}</div>
            <h1 style={{fontSize:32,marginBottom:6}}>{jogo.time_casa} × {jogo.time_fora}</h1>
            <p style={{color:'var(--muted)',fontSize:14}}>
              {new Date(jogo.data_hora).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
            </p>
          </div>

          <div style={{background:'var(--gold-light)',borderRadius:12,padding:'1rem',textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{fontSize:12,color:'#633806',marginBottom:4}}>💰 Prêmio do jogo</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:'var(--gold)'}}>R$ {jogo.premio_fixo?.toLocaleString('pt-BR')}</div>
            <div style={{fontSize:12,color:'#633806'}}>Dividido entre todos que acertarem</div>
          </div>

          <div style={{marginBottom:'1.5rem'}}>
            <p style={{fontWeight:500,marginBottom:'1rem',textAlign:'center'}}>Qual será o placar?</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'1.5rem'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:13,color:'var(--muted)',marginBottom:6}}>{jogo.time_casa}</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <button onClick={() => setGoalsCasa(Math.max(0, goalsCasa-1))} style={{width:36,height:36,borderRadius:8,border:'1px solid var(--border)',background:'white',fontSize:18,cursor:'pointer'}}>−</button>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:48,minWidth:48,textAlign:'center'}}>{goalsCasa}</span>
                  <button onClick={() => setGoalsCasa(goalsCasa+1)} style={{width:36,height:36,borderRadius:8,border:'1px solid var(--border)',background:'white',fontSize:18,cursor:'pointer'}}>+</button>
                </div>
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:'var(--muted)'}}>×</div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:13,color:'var(--muted)',marginBottom:6}}>{jogo.time_fora}</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <button onClick={() => setGoalsFora(Math.max(0, goalsFora-1))} style={{width:36,height:36,borderRadius:8,border:'1px solid var(--border)',background:'white',fontSize:18,cursor:'pointer'}}>−</button>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:48,minWidth:48,textAlign:'center'}}>{goalsFora}</span>
                  <button onClick={() => setGoalsFora(goalsFora+1)} style={{width:36,height:36,borderRadius:8,border:'1px solid var(--border)',background:'white',fontSize:18,cursor:'pointer'}}>+</button>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div style={{background:'var(--bg)',borderRadius:10,padding:'12px 16px',marginBottom:'1rem',display:'flex',justifyContent:'space-between',fontSize:14}}>
            <span style={{color:'var(--muted)'}}>Seu palpite</span>
            <strong>{jogo.time_casa} {goalsCasa} × {goalsFora} {jogo.time_fora}</strong>
          </div>
          <div style={{background:'var(--bg)',borderRadius:10,padding:'12px 16px',marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',fontSize:14}}>
            <span style={{color:'var(--muted)'}}>Valor a pagar</span>
            <strong style={{color:'var(--green)'}}>R$ {jogo.valor_palpite?.toFixed(2)}</strong>
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={apostar} disabled={submitting}>
            {submitting ? 'Gerando PIX...' : `✅ Confirmar e Pagar R$ ${jogo.valor_palpite?.toFixed(2)}`}
          </button>
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
