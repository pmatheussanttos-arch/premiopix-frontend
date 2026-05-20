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

  // ── Import state ──────────────────────────────────────────────────────────
  const [importStep, setImportStep] = useState(null); // null | 'loading' | 'lista' | 'importando'
  const [jogosApi, setJogosApi] = useState([]);
  const [selecionados, setSelecionados] = useState({});   // {index: true/false}
  const [importValorPalpite, setImportValorPalpite] = useState(5);
  const [importPremio, setImportPremio] = useState(100);
  const [importMsg, setImportMsg] = useState('');

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

  // ── Import handlers ───────────────────────────────────────────────────────

  const buscarJogosApi = async () => {
    setImportStep('loading');
    setImportMsg('');
    setJogosApi([]);
    setSelecionados({});
    try {
      const r = await axios.get(`${API}/admin/jogos/importar?dias=7`);
      const lista = (r.data.jogos || []).filter(j => !j.erro);
      const erros = (r.data.jogos || []).filter(j => j.erro);
      setJogosApi(lista);
      const sel = {};
      lista.forEach((_, i) => { sel[i] = true; });
      setSelecionados(sel);
      if (erros.length > 0) {
        setImportMsg(`⚠️ ${erros.length} liga(s) com erro: ${erros.map(e => e.erro).join(' | ')}`);
      }
      setImportStep('lista');
    } catch(e) {
      const detail = e.response?.data?.detail || 'Erro ao buscar jogos';
      setImportMsg(`❌ ${detail}`);
      setImportStep(null);
    }
  };

  const confirmarImportacao = async () => {
    const selecionadosList = jogosApi.filter((_, i) => selecionados[i]);
    if (selecionadosList.length === 0) {
      setImportMsg('⚠️ Selecione ao menos um jogo');
      return;
    }
    setImportStep('importando');
    setImportMsg('');
    try {
      const r = await axios.post(`${API}/admin/jogos/importar/confirmar`, {
        jogos: selecionadosList.map(j => ({
          fixture_api_id: j.fixture_api_id,
          time_casa: j.time_casa,
          time_fora: j.time_fora,
          campeonato: j.campeonato,
          data_hora: j.data_hora,
          valor_palpite: importValorPalpite,
          premio_fixo: importPremio,
        })),
      });
      setMsg(`✅ ${r.data.criados} jogo(s) importado(s) com sucesso!`);
      setImportStep(null);
      setJogosApi([]);
      load();
    } catch(e) {
      setImportMsg('❌ ' + (e.response?.data?.detail || 'Erro ao importar'));
      setImportStep('lista');
    }
  };

  const toggleTodos = (val) => {
    const sel = {};
    jogosApi.forEach((_, i) => { sel[i] = val; });
    setSelecionados(sel);
  };

  const numSelecionados = Object.values(selecionados).filter(Boolean).length;

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  const tabs = ['dashboard', 'jogos', 'usuarios'];

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="container">
        <h1 style={{fontSize:36,marginBottom:'1.5rem',fontFamily:"'Bebas Neue'",letterSpacing:1}}>
          ⚙ Painel Admin
        </h1>
        <div style={{display:'flex',gap:8,marginBottom:'1.5rem',flexWrap:'wrap'}}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'8px 20px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer',
              background: tab===t ? '#0D1B2A' : 'white',
              color: tab===t ? 'white' : '#555',
              border: tab===t ? 'none' : '1px solid #e0e0e0',
            }}>
              {t === 'dashboard' ? '📊 Dashboard' : t === 'jogos' ? '⚽ Jogos' : '👥 Usuários'}
            </button>
          ))}
        </div>
        {msg && (
          <div style={{
            background: msg.startsWith('✅') ? '#e6fff3' : '#fef2f2',
            border: `1px solid ${msg.startsWith('✅') ? '#c6edd9' : '#fca5a5'}`,
            color: msg.startsWith('✅') ? '#00C16A' : '#dc2626',
            borderRadius:10, padding:'12px 16px', marginBottom:'1rem', fontWeight:600,
          }}>
            {msg}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
            {[
              ['Usuários',stats.total_users,'👥'],
              ['Palpites',stats.total_palpites,'🎯'],
              ['Cartelas',stats.total_cartelas,'✨'],
              ['Receita',`R$ ${stats.receita_total?.toFixed(2)}`,'💰'],
              ['Jogos Abertos',stats.jogos_abertos,'⚽'],
              ['Desafios Abertos',stats.desafios_abertos,'🏆'],
            ].map(([label,val,icon]) => (
              <div key={label} style={{background:'white',border:'1px solid #eee',borderRadius:14,padding:'1.1rem',textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:28,marginBottom:4}}>{icon}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:'#00C16A'}}>{val}</div>
                <div style={{fontSize:12,color:'#888'}}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── JOGOS ── */}
        {tab === 'jogos' && (
          <div>
            {/* ─ SEÇÃO IMPORTAR ─ */}
            <div style={{
              background:'white', borderRadius:16, padding:'1.5rem',
              boxShadow:'0 2px 16px rgba(0,0,0,0.06)', marginBottom:'1.5rem',
              border:'1px solid #eee',
            }}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom: importStep ? '1rem' : 0}}>
                <div>
                  <h3 style={{fontSize:18,fontWeight:700,color:'#111',marginBottom:2}}>🔄 Importar Jogos Automático</h3>
                  {!importStep && (
                    <p style={{fontSize:13,color:'#888',margin:0}}>
                      Busca jogos das próximas 7 dias: Brasileirão, Copa do Brasil, Champions League
                    </p>
                  )}
                </div>
                {!importStep && (
                  <button onClick={buscarJogosApi} style={{
                    background:'linear-gradient(135deg,#00C16A,#00a857)',
                    color:'white', border:'none', borderRadius:12,
                    padding:'10px 22px', fontSize:14, fontWeight:700,
                    cursor:'pointer', whiteSpace:'nowrap',
                    boxShadow:'0 3px 12px rgba(0,193,106,0.3)',
                  }}>
                    🔄 Buscar Jogos da Semana
                  </button>
                )}
              </div>

              {importStep === 'loading' && (
                <div style={{textAlign:'center',padding:'2rem',color:'#888'}}>
                  <div className="spinner" style={{margin:'0 auto 12px'}}></div>
                  Buscando jogos na API-Football...
                </div>
              )}

              {(importStep === 'lista' || importStep === 'importando') && (
                <>
                  {importMsg && (
                    <div style={{
                      background:'#fffbeb',border:'1px solid #ffe082',
                      borderRadius:8,padding:'10px 14px',
                      fontSize:13,color:'#92400e',marginBottom:'1rem',
                    }}>
                      {importMsg}
                    </div>
                  )}

                  {jogosApi.length === 0 ? (
                    <div style={{textAlign:'center',padding:'1.5rem',color:'#888',fontSize:14}}>
                      Nenhum jogo encontrado para as próximas 7 dias nas ligas selecionadas.
                    </div>
                  ) : (
                    <>
                      {/* Configurações globais */}
                      <div style={{display:'flex',gap:16,marginBottom:'1rem',flexWrap:'wrap',alignItems:'flex-end'}}>
                        <div>
                          <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>Valor palpite (R$)</label>
                          <input
                            type="number" min="1" value={importValorPalpite}
                            onChange={e => setImportValorPalpite(parseFloat(e.target.value)||5)}
                            style={{width:100,padding:'7px 10px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14}}
                          />
                        </div>
                        <div>
                          <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>Prêmio fixo (R$)</label>
                          <input
                            type="number" min="0" value={importPremio}
                            onChange={e => setImportPremio(parseFloat(e.target.value)||0)}
                            style={{width:120,padding:'7px 10px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14}}
                          />
                        </div>
                        <div style={{display:'flex',gap:8,marginBottom:2}}>
                          <button onClick={() => toggleTodos(true)} style={{
                            background:'#f0f9f4',color:'#00C16A',border:'1px solid #c6edd9',
                            borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',
                          }}>
                            Selecionar tudo
                          </button>
                          <button onClick={() => toggleTodos(false)} style={{
                            background:'#fafafa',color:'#888',border:'1px solid #e0e0e0',
                            borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',
                          }}>
                            Desmarcar tudo
                          </button>
                        </div>
                      </div>

                      {/* Lista de jogos */}
                      <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:'1rem',maxHeight:360,overflowY:'auto'}}>
                        {jogosApi.map((j, i) => (
                          <label key={i} style={{
                            display:'flex', alignItems:'center', gap:12,
                            padding:'10px 14px', borderRadius:10, cursor:'pointer',
                            background: selecionados[i] ? '#f0f9f4' : '#fafafa',
                            border: `1px solid ${selecionados[i] ? '#c6edd9' : '#eee'}`,
                            transition:'all 0.15s',
                          }}>
                            <input
                              type="checkbox"
                              checked={!!selecionados[i]}
                              onChange={e => setSelecionados(s => ({...s, [i]: e.target.checked}))}
                              style={{width:16,height:16,accentColor:'#00C16A',flexShrink:0}}
                            />
                            <div style={{flex:1}}>
                              <div style={{fontWeight:700,fontSize:14,color:'#111'}}>
                                {j.time_casa} <span style={{color:'#ccc'}}>×</span> {j.time_fora}
                              </div>
                              <div style={{fontSize:12,color:'#888',marginTop:1}}>
                                {j.campeonato} · {new Date(j.data_hora).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                              </div>
                            </div>
                            <span style={{
                              fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,
                              background:'#fffbeb',color:'#92400e',border:'1px solid #ffe082',
                              whiteSpace:'nowrap',
                            }}>
                              {j.campeonato.split(' ')[0]}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div style={{display:'flex',gap:10,alignItems:'center'}}>
                        <button
                          onClick={confirmarImportacao}
                          disabled={importStep === 'importando' || numSelecionados === 0}
                          style={{
                            background: numSelecionados === 0 ? '#aaa' : '#0D1B2A',
                            color:'white', border:'none', borderRadius:12,
                            padding:'11px 24px', fontSize:14, fontWeight:700,
                            cursor: numSelecionados === 0 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {importStep === 'importando'
                            ? '⏳ Importando...'
                            : `✅ Importar ${numSelecionados} jogo(s) selecionado(s)`}
                        </button>
                        <button
                          onClick={() => { setImportStep(null); setJogosApi([]); setImportMsg(''); }}
                          style={{
                            background:'transparent',color:'#888',border:'1px solid #e0e0e0',
                            borderRadius:12,padding:'11px 18px',fontSize:14,cursor:'pointer',
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* ─ CRIAR JOGO MANUAL + RESULTADO ─ */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'start',marginBottom:'1.5rem'}}>
              <div>
                <h3 style={{fontSize:18,fontWeight:700,marginBottom:'1rem'}}>➕ Criar Jogo Manual</h3>
                <div style={{background:'white',borderRadius:14,padding:'1.25rem',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',border:'1px solid #eee'}}>
                  {[['time_casa','Time Casa'],['time_fora','Time Fora'],['campeonato','Campeonato']].map(([k,l]) => (
                    <div style={{marginBottom:12}} key={k}>
                      <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>{l}</label>
                      <input
                        value={novoJogo[k]}
                        onChange={e => setNovoJogo(j => ({...j,[k]:e.target.value}))}
                        style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box'}}
                      />
                    </div>
                  ))}
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>Data e Hora</label>
                    <input type="datetime-local" value={novoJogo.data_hora}
                      onChange={e => setNovoJogo(j => ({...j,data_hora:e.target.value}))}
                      style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box'}}
                    />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                    <div>
                      <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>Valor palpite (R$)</label>
                      <input type="number" value={novoJogo.valor_palpite}
                        onChange={e => setNovoJogo(j => ({...j,valor_palpite:parseFloat(e.target.value)}))}
                        style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box'}}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>Prêmio (R$)</label>
                      <input type="number" value={novoJogo.premio_fixo}
                        onChange={e => setNovoJogo(j => ({...j,premio_fixo:parseFloat(e.target.value)}))}
                        style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box'}}
                      />
                    </div>
                  </div>
                  <button onClick={criarJogo} style={{
                    width:'100%',background:'#0D1B2A',color:'white',border:'none',
                    borderRadius:10,padding:'11px',fontSize:14,fontWeight:700,cursor:'pointer',
                  }}>
                    Criar Jogo
                  </button>
                </div>

                <h3 style={{fontSize:18,fontWeight:700,margin:'1.5rem 0 1rem'}}>🏁 Lançar Resultado</h3>
                <div style={{background:'white',borderRadius:14,padding:'1.25rem',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',border:'1px solid #eee'}}>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>Selecionar Jogo</label>
                    <select value={resultado.jogo_id} onChange={e => setResultado(r => ({...r,jogo_id:e.target.value}))}
                      style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box'}}>
                      <option value="">Selecione...</option>
                      {jogos.filter(j => j.status==='aberto').map(j => (
                        <option key={j.id} value={j.id}>{j.time_casa} × {j.time_fora}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                    <div>
                      <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>Gols Casa</label>
                      <input type="number" min="0" value={resultado.gols_casa}
                        onChange={e => setResultado(r => ({...r,gols_casa:parseInt(e.target.value)||0}))}
                        style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box'}}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>Gols Fora</label>
                      <input type="number" min="0" value={resultado.gols_fora}
                        onChange={e => setResultado(r => ({...r,gols_fora:parseInt(e.target.value)||0}))}
                        style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box'}}
                      />
                    </div>
                  </div>
                  <button onClick={lancarResultado} disabled={!resultado.jogo_id} style={{
                    width:'100%',background:resultado.jogo_id?'#FFB800':'#ccc',
                    color:'white',border:'none',borderRadius:10,
                    padding:'11px',fontSize:14,fontWeight:700,
                    cursor:resultado.jogo_id?'pointer':'not-allowed',
                  }}>
                    Lançar Resultado
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{fontSize:18,fontWeight:700,marginBottom:'1rem'}}>⚽ Jogos ({jogos.length})</h3>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {jogos.map(j => (
                    <div key={j.id} style={{
                      background:'white',borderRadius:12,padding:'12px 14px',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.04)',border:'1px solid #eee',fontSize:13,
                    }}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <strong>{j.time_casa} × {j.time_fora}</strong>
                        <span style={{
                          fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,
                          background:j.status==='aberto'?'#e6fff3':'#f5f5f5',
                          color:j.status==='aberto'?'#00C16A':'#888',
                          border:`1px solid ${j.status==='aberto'?'#c6edd9':'#e0e0e0'}`,
                        }}>
                          {j.status}
                        </span>
                      </div>
                      <div style={{color:'#888',marginTop:4,fontSize:12}}>
                        {j.campeonato} · {j.total_palpites} palpites · R$ {j.premio_fixo}
                      </div>
                      <div style={{color:'#aaa',fontSize:11,marginTop:2}}>
                        {new Date(j.data_hora).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── USUÁRIOS ── */}
        {tab === 'usuarios' && (
          <div style={{background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 16px rgba(0,0,0,0.06)'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#0D1B2A',color:'white',fontSize:12}}>
                  {['#','Nome','Email','Admin','Cadastro'].map(h => (
                    <th key={h} style={{padding:'12px 16px',textAlign:'left',fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{borderTop:'1px solid #f0f0f0',fontSize:13}}>
                    <td style={{padding:'11px 16px',color:'#aaa'}}>{u.id}</td>
                    <td style={{padding:'11px 16px',fontWeight:500}}>{u.nome}</td>
                    <td style={{padding:'11px 16px',color:'#888'}}>{u.email}</td>
                    <td style={{padding:'11px 16px'}}>
                      {u.is_admin
                        ? <span style={{background:'#fffbeb',color:'#FFB800',border:'1px solid #ffe082',borderRadius:20,fontSize:11,padding:'2px 10px',fontWeight:600}}>Admin</span>
                        : <span style={{background:'#f5f5f5',color:'#888',border:'1px solid #e0e0e0',borderRadius:20,fontSize:11,padding:'2px 10px',fontWeight:600}}>User</span>
                      }
                    </td>
                    <td style={{padding:'11px 16px',color:'#aaa',fontSize:12}}>
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
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
