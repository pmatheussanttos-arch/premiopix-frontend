import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PixModal from '../components/PixModal';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

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

  const update = (idx, campo, val) => {
    const n = [...palpites];
    n[idx] = { ...n[idx], [campo]: Math.max(0, parseInt(val) || 0) };
    setPalpites(n);
  };

  const comprar = async () => {
    setError(''); setSubmitting(true);
    try {
      const r = await axios.post(`${API}/mestre/comprar`, { desafio_id: parseInt(id), palpites });
      setPagamento(r.data.pagamento);
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao registrar cartela');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  if (!desafio) return null;

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="container" style={{maxWidth:680}}>
        <button onClick={() => navigate(-1)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',fontSize:14,marginBottom:'1.5rem'}}>← Voltar</button>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'1.5rem',alignItems:'start'}}>
          <div>
            <h1 style={{fontSize:36,marginBottom:'0.5rem'}}>✨ {desafio.titulo}</h1>
            <p style={{color:'var(--muted)',marginBottom:'1.5rem'}}>Preencha os {desafio.jogos.length} palpites de placar</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {desafio.jogos.map((j, i) => (
                <div key={j.id} className="card-sm" style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:22,color:'var(--muted)',minWidth:24}}>{i+1}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,fontSize:14}}>{j.time_casa} × {j.time_fora}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{new Date(j.data_hora).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <input type="number" min="0" max="9" value={palpites[i]?.gols_casa}
                      onChange={e => update(i,'gols_casa',e.target.value)}
                      style={{width:44,height:38,textAlign:'center',border:'1px solid var(--border)',borderRadius:8,fontSize:18,fontWeight:600,fontFamily:'Outfit'}} />
                    <span style={{color:'var(--muted)'}}>×</span>
                    <input type="number" min="0" max="9" value={palpites[i]?.gols_fora}
                      onChange={e => update(i,'gols_fora',e.target.value)}
                      style={{width:44,height:38,textAlign:'center',border:'1px solid var(--border)',borderRadius:8,fontSize:18,fontWeight:600,fontFamily:'Outfit'}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{minWidth:220,position:'sticky',top:80}}>
            <h3 style={{fontSize:18,marginBottom:'1rem'}}>Resumo</h3>
            <div style={{fontSize:14,marginBottom:8,display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--muted)'}}>Palpites</span><strong>{desafio.jogos.length} jogos</strong></div>
            <div style={{fontSize:14,marginBottom:8,display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--muted)'}}>Valor</span><strong>R$ {desafio.valor_cartela?.toFixed(2)}</strong></div>
            <div style={{background:'var(--purple-light)',borderRadius:10,padding:'12px',textAlign:'center',marginBottom:'1rem'}}>
              <div style={{fontSize:12,color:'var(--purple-dark)'}}>Prêmio</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:'var(--purple)'}}>R$ {desafio.valor_premio?.toLocaleString('pt-BR')}</div>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-purple btn-full" onClick={comprar} disabled={submitting}>
              {submitting ? 'Gerando PIX...' : `Pagar R$ ${desafio.valor_cartela?.toFixed(2)} via PIX`}
            </button>
          </div>
        </div>
      </div>
      {pagamento && (
        <PixModal pagamento={pagamento} onClose={() => setPagamento(null)}
          onConfirmed={() => { setPagamento(null); navigate('/meus-jogos'); }} />
      )}
    </div>
  );
}
