import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

export default function Mestre() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API}/mestre/publico/jogos`).then(r => setDesafios(r.data)).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  return (
    <div style={{padding:'2rem 0'}}>
      <div className="container">
        <h1 style={{fontSize:42,marginBottom:'0.5rem'}}>✨ Mestre do Placar</h1>
        <p style={{color:'var(--muted)',marginBottom:'2rem'}}>Preencha os palpites de 5 jogos e concorra ao prêmio maior</p>
        {desafios.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'3rem'}}>
            <p style={{fontSize:48,marginBottom:'1rem'}}>⏳</p>
            <h3>Nenhum desafio disponível</h3>
            <p style={{color:'var(--muted)'}}>Aguarde novos desafios!</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
            {desafios.map(d => (
              <div key={d.id} className="card" style={{borderTop:'3px solid var(--purple)',transition:'transform 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e=>e.currentTarget.style.transform=''}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <span style={{fontSize:12,color:'var(--purple)',fontWeight:600}}>{d.campeonato || 'Futebol'}</span>
                  <span className="badge badge-purple">Aberto</span>
                </div>
                <h3 style={{fontWeight:600,fontSize:18,marginBottom:12}}>{d.titulo}</h3>
                <div style={{background:'var(--purple-light)',borderRadius:10,padding:'10px',textAlign:'center',marginBottom:12}}>
                  <div style={{fontSize:12,color:'var(--purple-dark)'}}>Prêmio acumulado</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:'var(--purple)'}}>R$ {d.valor_premio?.toLocaleString('pt-BR')}</div>
                </div>
                <div style={{marginBottom:12}}>
                  {d.jogos?.slice(0,3).map((j,i) => (
                    <div key={j.id} style={{fontSize:12,color:'var(--muted)',padding:'3px 0',borderBottom:'1px solid var(--border)'}}>
                      {i+1}. {j.time_casa} × {j.time_fora}
                    </div>
                  ))}
                  {d.jogos?.length > 3 && <div style={{fontSize:12,color:'var(--purple)',marginTop:4}}>+{d.jogos.length-3} jogos...</div>}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:13,fontWeight:500}}>R$ {d.valor_cartela?.toFixed(2)} /cartela · {d.participantes} participantes</span>
                  <Link to={`/mestre/comprar/${d.id}`}><button className="btn btn-purple">Entrar →</button></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
