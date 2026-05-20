import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [jogos, setJogos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoJogo, setNovoJogo] = useState({ time_casa:'',time_fora:'',campeonato:'',data_hora:'',valor_palpite:5,premio_fixo:100 });
  const [resultado, setResultado] = useState({ jogo_id:'', gols_casa:0, gols_fora:0 });
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, j, u] = await Promise.all([
        axios.get(`${API}/admin/dashboard`),
        axios.get(`${API}/admin/jogos`),
        axios.get(`${API}/admin/usuarios`),
      ]);
      setStats(s.data); setJogos(j.data); setUsuarios(u.data);
    } catch(e) {
      const status = e.response?.status;
      const detail = e.response?.data?.detail || 'Erro ao carregar';
      setMsg(`❌ [${status || 'rede'}] ${detail}`);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const criarJogo = async () => {
    try {
      await axios.post(`${API}/admin/jogos`, {
        ...novoJogo,
        data_hora: new Date(novoJogo.data_hora).toISOString()
      });
      setMsg('✅ Jogo criado!');
      setNovoJogo({ time_casa:'',time_fora:'',campeonato:'',data_hora:'',valor_palpite:5,premio_fixo:100 });
      load();
    } catch(e) { setMsg('❌ ' + (e.response?.data?.detail || 'Erro')); }
  };

  const lancarResultado = async () => {
    try {
      await axios.post(`${API}/admin/jogos/${resultado.jogo_id}/resultado`, {
        gols_casa: resultado.gols_casa, gols_fora: resultado.gols_fora
      });
      setMsg('✅ Resultado lançado!');
      load();
    } catch(e) { setMsg('❌ ' + (e.response?.data?.detail || 'Erro')); }
  };

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="container">
        <h1 style={{fontSize:36,marginBottom:'1.5rem'}}>⚙ Painel Admin</h1>
        <div style={{display:'flex',gap:8,marginBottom:'1.5rem',flexWrap:'wrap'}}>
          {['dashboard','jogos','usuarios'].map(t => (
            <button key={t} className={`btn ${tab===t?'btn-primary':'btn-outline'}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        {msg && <div className={msg.startsWith('✅')?'success-msg':'error-msg'} style={{marginBottom:'1rem'}}>{msg}</div>}

        {tab === 'dashboard' && stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
            {[
              ['Usuários',stats.total_users,'👥'],
              ['Palpites',stats.total_palpites,'🎯'],
              ['Cartelas',stats.total_cartelas,'✨'],
              ['Receita',`R$ ${stats.receita_total?.toFixed(2)}`,'💰'],
              ['Jogos Abertos',stats.jogos_abertos,'⚽'],
            ].map(([label,val,icon]) => (
              <div key={label} style={{background:'white',border:'1px solid var(--border)',borderRadius:12,padding:'1rem',textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:4}}>{icon}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:'var(--green)'}}>{val}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'jogos' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'start'}}>
            <div>
              <h3 style={{fontSize:22,marginBottom:'1rem'}}>Criar Jogo</h3>
              <div className="card">
                {[['time_casa','Time Casa'],['time_fora','Time Fora'],['campeonato','Campeonato']].map(([k,l]) => (
                  <div className="form-group" key={k}><label>{l}</label>
                    <input value={novoJogo[k]} onChange={e=>setNovoJogo(j=>({...j,[k]:e.target.value}))} /></div>
                ))}
                <div className="form-group"><label>Data e Hora</label>
                  <input type="datetime-local" value={novoJogo.data_hora} onChange={e=>setNovoJogo(j=>({...j,data_hora:e.target.value}))} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="form-group"><label>Valor palpite (R$)</label>
                    <input type="number" value={novoJogo.valor_palpite} onChange={e=>setNovoJogo(j=>({...j,valor_palpite:parseFloat(e.target.value)}))} /></div>
                  <div className="form-group"><label>Prêmio (R$)</label>
                    <input type="number" value={novoJogo.premio_fixo} onChange={e=>setNovoJogo(j=>({...j,premio_fixo:parseFloat(e.target.value)}))} /></div>
                </div>
                <button className="btn btn-primary btn-full" onClick={criarJogo}>Criar Jogo</button>
              </div>

              <h3 style={{fontSize:22,margin:'1.5rem 0 1rem'}}>Lançar Resultado</h3>
              <div className="card">
                <div className="form-group"><label>Selecionar Jogo</label>
                  <select value={resultado.jogo_id} onChange={e=>setResultado(r=>({...r,jogo_id:e.target.value}))}>
                    <option value="">Selecione...</option>
                    {jogos.filter(j=>j.status==='aberto').map(j => (
                      <option key={j.id} value={j.id}>{j.time_casa} x {j.time_fora}</option>
                    ))}
                  </select>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="form-group"><label>Gols Casa</label>
                    <input type="number" min="0" value={resultado.gols_casa} onChange={e=>setResultado(r=>({...r,gols_casa:parseInt(e.target.value)||0}))} /></div>
                  <div className="form-group"><label>Gols Fora</label>
                    <input type="number" min="0" value={resultado.gols_fora} onChange={e=>setResultado(r=>({...r,gols_fora:parseInt(e.target.value)||0}))} /></div>
                </div>
                <button className="btn btn-gold btn-full" onClick={lancarResultado} disabled={!resultado.jogo_id}>Lançar Resultado</button>
              </div>
            </div>

            <div>
              <h3 style={{fontSize:22,marginBottom:'1rem'}}>Jogos ({jogos.length})</h3>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {jogos.map(j => (
                  <div key={j.id} className="card-sm" style={{fontSize:13}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <strong>{j.time_casa} x {j.time_fora}</strong>
                      <span className={`badge ${j.status==='aberto'?'badge-green':'badge-gray'}`}>{j.status}</span>
                    </div>
                    <div style={{color:'var(--muted)',marginTop:4}}>{j.campeonato} · {j.total_palpites} palpites · R${j.premio_fixo}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'usuarios' && (
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'var(--bg)',fontSize:12,color:'var(--muted)'}}>
                  {['#','Nome','Email','Admin','Cadastro'].map(h => (
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{borderTop:'1px solid var(--border)',fontSize:13}}>
                    <td style={{padding:'10px 14px',color:'var(--muted)'}}>{u.id}</td>
                    <td style={{padding:'10px 14px',fontWeight:500}}>{u.nome}</td>
                    <td style={{padding:'10px 14px',color:'var(--muted)'}}>{u.email}</td>
                    <td style={{padding:'10px 14px'}}>{u.is_admin?<span className="badge badge-purple">Admin</span>:<span className="badge badge-gray">User</span>}</td>
                    <td style={{padding:'10px 14px',color:'var(--muted)',fontSize:12}}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
