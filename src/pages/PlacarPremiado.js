// ─── PlacarPremiado.js ────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export function PlacarPremiado() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API}/jogos/publico`).then(r => setJogos(r.data)).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  return (
    <div style={{padding:'2rem 0'}}>
      <div className="container">
        <h1 style={{fontSize:42,marginBottom:'0.5rem'}}>🎯 Placar Premiado</h1>
        <p style={{color:'var(--muted)',marginBottom:'2rem'}}>Escolha um jogo e aposte no placar exato</p>
        {jogos.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'3rem'}}>
            <p style={{fontSize:48,marginBottom:'1rem'}}>⏳</p>
            <h3>Nenhum jogo disponível no momento</h3>
            <p style={{color:'var(--muted)'}}>Aguarde novos jogos!</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
            {jogos.map(j => (
              <div key={j.id} className="card" style={{transition:'transform 0.2s',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e=>e.currentTarget.style.transform=''}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <span style={{fontSize:12,color:'var(--green)',fontWeight:600}}>{j.campeonato}</span>
                  <span className="badge badge-green">Aberto</span>
                </div>
                <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:18,marginBottom:12}}>{j.time_casa} × {j.time_fora}</h3>
                <div style={{background:'var(--gold-light)',borderRadius:10,padding:'10px',textAlign:'center',marginBottom:12}}>
                  <div style={{fontSize:12,color:'#633806'}}>Prêmio</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:'var(--gold)'}}>R$ {j.premio_fixo?.toLocaleString('pt-BR')}</div>
                </div>
                <div style={{fontSize:12,color:'var(--muted)',marginBottom:12}}>
                  📅 {new Date(j.data_hora).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · {j.total_apostas} apostas
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:13,fontWeight:500}}>R$ {j.valor_palpite?.toFixed(2)} /palpite</span>
                  <Link to={`/placar/${j.id}`}><button className="btn btn-primary">Apostar →</button></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
