import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export default function Home() {
  const [placarGames, setPlacarGames] = useState([]);
  const [mestreGames, setMestreGames] = useState([]);
  const [ganhadores, setGanhadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/jogos/publico`).catch(() => ({ data: [] })),
      axios.get(`${API}/mestre/publico/jogos`).catch(() => ({ data: [] })),
      axios.get(`${API}/ganhadores/`).catch(() => ({ data: [] })),
    ]).then(([p, m, g]) => {
      setPlacarGames(p.data.slice(0, 4));
      setMestreGames(m.data.slice(0, 4));
      setGanhadores(g.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div>
      {/* HERO */}
      <section style={{background:'linear-gradient(135deg,#0a1628 0%,#0f2640 50%,#0a1628 100%)',color:'white',padding:'4rem 0 3rem'}}>
        <div className="container" style={{textAlign:'center'}}>
          <div className="badge badge-green" style={{marginBottom:'1.5rem',fontSize:12}}>🏆 Concurso de habilidade esportiva</div>
          <h1 style={{fontSize:'clamp(40px,8vw,72px)',lineHeight:1,marginBottom:'1rem'}}>
            Acerte o Placar,<br />
            <span style={{color:'var(--gold)'}}>Ganhe o Prêmio</span>
          </h1>
          <p style={{fontSize:17,color:'rgba(255,255,255,0.7)',maxWidth:520,margin:'0 auto 2.5rem'}}>
            Escolha o placar dos jogos, pague via PIX e concorra ao prêmio. Simples, rápido e seguro.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/placar-premiado"><button className="btn btn-primary btn-lg">🎯 Placar Premiado</button></Link>
            <Link to="/mestre"><button className="btn btn-lg" style={{background:'var(--purple)',color:'white'}}>✨ Mestre do Placar</button></Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{background:'var(--green-dark)',color:'white',display:'flex',justifyContent:'center',flexWrap:'wrap'}}>
        {[['Prêmios Pagos','R$ 12.400+'],['Apostas Realizadas','3.820+'],['Ganhadores','847+'],['Pagamentos no Prazo','98%']].map(([label, val]) => (
          <div key={label} style={{padding:'1rem 2.5rem',textAlign:'center',borderRight:'1px solid rgba(255,255,255,0.15)'}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:30,color:'var(--gold)'}}>{val}</div>
            <div style={{fontSize:12,opacity:0.8}}>{label}</div>
          </div>
        ))}
      </div>

      {/* PLACAR PREMIADO */}
      {placarGames.length > 0 && (
        <section style={{padding:'3rem 0',background:'white'}}>
          <div className="container">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2 style={{fontSize:32}}>🎯 Placar Premiado</h2>
              <Link to="/placar-premiado"><button className="btn btn-outline">Ver todos →</button></Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
              {placarGames.map(j => (
                <div key={j.id} className="card-sm" style={{transition:'transform 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:11,color:'var(--green)',fontWeight:600}}>{j.campeonato}</span>
                    <span className="badge badge-green">Aberto</span>
                  </div>
                  <h3 style={{fontSize:15,fontFamily:'Outfit',fontWeight:600,marginBottom:10}}>{j.time_casa} × {j.time_fora}</h3>
                  <div style={{background:'var(--gold-light)',borderRadius:8,padding:'8px 12px',textAlign:'center',marginBottom:10}}>
                    <div style={{fontSize:11,color:'#633806'}}>Prêmio</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:'var(--gold)'}}>R$ {j.premio_fixo?.toLocaleString('pt-BR')}</div>
                  </div>
                  <div style={{fontSize:12,color:'var(--muted)',marginBottom:10}}>{j.total_apostas} apostas · R$ {j.valor_palpite?.toFixed(2)}/palpite</div>
                  <Link to={`/placar/${j.id}`}><button className="btn btn-primary btn-full">Apostar agora</button></Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MESTRE */}
      {mestreGames.length > 0 && (
        <section style={{padding:'3rem 0',background:'var(--bg)'}}>
          <div className="container">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2 style={{fontSize:32}}>✨ Mestre do Placar</h2>
              <Link to="/mestre"><button className="btn btn-outline">Ver todos →</button></Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
              {mestreGames.map(d => (
                <div key={d.id} className="card-sm"
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}
                  style={{transition:'transform 0.2s',borderTop:'3px solid var(--purple)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:11,color:'var(--purple)',fontWeight:600}}>{d.campeonato || 'Futebol'}</span>
                    <span className="badge badge-purple">Aberto</span>
                  </div>
                  <h3 style={{fontSize:15,fontWeight:600,marginBottom:10}}>{d.titulo}</h3>
                  <div style={{background:'var(--purple-light)',borderRadius:8,padding:'8px 12px',textAlign:'center',marginBottom:10}}>
                    <div style={{fontSize:11,color:'var(--purple-dark)'}}>Prêmio</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:'var(--purple)'}}>R$ {d.valor_premio?.toLocaleString('pt-BR')}</div>
                  </div>
                  <div style={{fontSize:12,color:'var(--muted)',marginBottom:10}}>{d.participantes} participantes · R$ {d.valor_cartela?.toFixed(2)}/cartela</div>
                  <Link to={`/mestre/comprar/${d.id}`}><button className="btn btn-purple btn-full">Entrar no desafio</button></Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GANHADORES */}
      {ganhadores.length > 0 && (
        <section style={{padding:'3rem 0',background:'white'}}>
          <div className="container">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2 style={{fontSize:32}}>🏆 Últimos Ganhadores</h2>
              <Link to="/ganhadores"><button className="btn btn-outline">Ver todos →</button></Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
              {ganhadores.map((g, i) => (
                <div key={i} className="card-sm" style={{background:'linear-gradient(135deg,var(--gold-light),white)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'var(--gold-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🏆</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:14}}>{g.nome?.split(' ')[0]}***</div>
                      <div style={{fontSize:12,color:'var(--muted)'}}>{g.tipo}</div>
                    </div>
                  </div>
                  <div style={{background:'white',borderRadius:8,padding:'8px',textAlign:'center'}}>
                    <div style={{fontSize:11,color:'var(--muted)'}}>Prêmio recebido</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:'var(--gold)'}}>R$ {g.valor_premio?.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMO FUNCIONA */}
      <section style={{padding:'3rem 0',background:'var(--bg)'}}>
        <div className="container">
          <h2 style={{textAlign:'center',fontSize:36,marginBottom:'0.5rem'}}>Como Funciona?</h2>
          <p style={{textAlign:'center',color:'var(--muted)',marginBottom:'2rem'}}>Simples, rápido e seguro</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
            {[
              { icon:'🎯', title:'Placar Premiado', color:'var(--green)', steps:['Escolha o jogo e o placar','Pague R$5 via PIX','Acertou? Divide o prêmio!'] },
              { icon:'✨', title:'Mestre do Placar', color:'var(--purple)', steps:['Preencha 5 palpites','Pague R$10 via PIX','Quem acertar mais ganha!'] }
            ].map(({ icon, title, color, steps }) => (
              <div key={title} className="card">
                <h3 style={{fontSize:22,marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:10}}><span>{icon}</span>{title}</h3>
                {steps.map((s, i) => (
                  <div key={i} style={{display:'flex',gap:12,marginBottom:12,alignItems:'flex-start'}}>
                    <div style={{minWidth:28,height:28,borderRadius:'50%',background:color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:13,color}}>{i+1}</div>
                    <span style={{paddingTop:4}}>{s}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0a1628',color:'white',padding:'3rem 0 2rem'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2rem',marginBottom:'2rem'}}>
            <div>
              <h4 style={{fontFamily:"'Bebas Neue'",fontSize:22,marginBottom:'1rem'}}>Prêmio<span style={{color:'var(--green)'}}>PIX</span></h4>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.5)'}}>Plataforma de concursos de habilidade esportiva.</p>
            </div>
            <div>
              <h5 style={{marginBottom:'0.75rem',fontWeight:500}}>Links</h5>
              {[['Placar Premiado','/placar-premiado'],['Mestre do Placar','/mestre'],['Ganhadores','/ganhadores']].map(([label,to]) => (
                <div key={to}><Link to={to} style={{color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:13,display:'block',marginBottom:6}}>{label}</Link></div>
              ))}
            </div>
            <div>
              <h5 style={{marginBottom:'0.75rem',fontWeight:500}}>Contato</h5>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.5)'}}>Dúvidas? Entre em contato pelo WhatsApp.</p>
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'1.5rem'}}>
            <div style={{background:'rgba(255,255,255,0.05)',borderRadius:10,padding:'1rem',fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:'1rem'}}>
              <strong style={{color:'rgba(255,255,255,0.6)'}}>Concurso de habilidade esportiva.</strong> A participação consiste na escolha de placares com base em conhecimento esportivo, não caracterizando jogo de azar, rifa ou sorteio.
            </div>
            <p style={{textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.3)'}}>© 2026 PrêmioPIX. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
