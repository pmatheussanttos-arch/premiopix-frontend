// MeusJogos.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

export function MeusJogos() {
  const [palpites, setPalpites] = useState([]);
  const [cartelas, setCartelas] = useState([]);
  const [tab, setTab] = useState('placar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/palpites/meus`).catch(() => ({ data: [] })),
      // cartelas endpoint can be added similarly
    ]).then(([p]) => { setPalpites(p.data); }).finally(() => setLoading(false));
  }, []);

  const statusBadge = (s) => {
    if (s === 'aprovado') return <span className="badge badge-green">Pago</span>;
    if (s === 'pendente') return <span className="badge badge-gold">Aguardando PIX</span>;
    return <span className="badge badge-gray">{s}</span>;
  };

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="container">
        <h1 style={{fontSize:36,marginBottom:'1.5rem'}}>Meus Jogos</h1>
        <div style={{display:'flex',gap:8,marginBottom:'1.5rem'}}>
          <button className={`btn ${tab==='placar'?'btn-primary':'btn-outline'}`} onClick={()=>setTab('placar')}>Placar Premiado ({palpites.length})</button>
        </div>
        {palpites.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'3rem'}}>
            <p style={{fontSize:48,marginBottom:8}}>🎯</p>
            <h3>Nenhuma aposta ainda</h3>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {palpites.map(p => (
              <div key={p.id} className="card-sm" style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600}}>{p.time_casa} × {p.time_fora}</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>
                    {new Date(p.data_hora).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,textAlign:'center'}}>
                  {p.gols_casa} × {p.gols_fora}
                  <div style={{fontSize:12,color:'var(--muted)',fontFamily:'Outfit',fontWeight:400}}>seu palpite</div>
                </div>
                {statusBadge(p.status_pag)}
                {p.acertou === true && <span className="badge badge-green">✅ Acertou! R$ {p.valor_premio?.toFixed(2)}</span>}
                {p.acertou === false && <span className="badge badge-red">❌ Não acertou</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Ganhadores.js
export function Ganhadores() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API}/ganhadores/`).then(r => setLista(r.data)).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;
  return (
    <div style={{padding:'2rem 0'}}>
      <div className="container">
        <h1 style={{fontSize:42,marginBottom:'0.5rem'}}>🏆 Ganhadores</h1>
        <p style={{color:'var(--muted)',marginBottom:'2rem'}}>Histórico de prêmios pagos na plataforma</p>
        <div className="card" style={{overflow:'hidden',padding:0}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--bg)',fontSize:12,color:'var(--muted)',fontWeight:500}}>
                <th style={{padding:'12px 16px',textAlign:'left'}}>Ganhador</th>
                <th style={{padding:'12px 16px',textAlign:'left'}}>Modalidade</th>
                <th style={{padding:'12px 16px',textAlign:'left'}}>Detalhe</th>
                <th style={{padding:'12px 16px',textAlign:'right'}}>Prêmio</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((g, i) => (
                <tr key={i} style={{borderTop:'1px solid var(--border)'}}>
                  <td style={{padding:'12px 16px',fontWeight:500}}>{g.nome?.split(' ')[0]}***</td>
                  <td style={{padding:'12px 16px'}}>
                    <span className={`badge ${g.tipo==='Placar Premiado'?'badge-green':'badge-purple'}`}>{g.tipo}</span>
                  </td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--muted)'}}>{g.detalhe}</td>
                  <td style={{padding:'12px 16px',textAlign:'right',fontFamily:"'Bebas Neue'",fontSize:18,color:'var(--gold)'}}>
                    R$ {g.valor_premio?.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length === 0 && (
            <div style={{textAlign:'center',padding:'3rem',color:'var(--muted)'}}>Nenhum ganhador ainda. Seja o primeiro!</div>
          )}
        </div>
      </div>
    </div>
  );
}
