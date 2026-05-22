import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://premiopix-backend.onrender.com') + '/api';

const css = `
.admin-tabs    { display: flex; gap: 8px; margin-bottom: 1.25rem; flex-wrap: wrap; }
.admin-2col    { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: start; margin-bottom: 1.5rem; }
.admin-import-cfg { display: flex; gap: 14px; margin-bottom: 1rem; flex-wrap: wrap; align-items: flex-end; }

@media (max-width: 680px) {
  .admin-2col { grid-template-columns: 1fr; }
  .admin-import-cfg { flex-direction: column; gap: 10px; }
  .admin-import-cfg > div { width: 100%; }
  .admin-import-cfg > div input { width: 100%; box-sizing: border-box; }
}
`;

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [jogos, setJogos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoJogo, setNovoJogo] = useState({ time_casa:'',time_fora:'',campeonato:'',data_hora:'',valor_palpite:5,premio_fixo:100 });
  const [resultado, setResultado] = useState({ jogo_id:'', gols_casa:0, gols_fora:0 });
  const [msg, setMsg] = useState('');
  const [jogoEditando, setJogoEditando] = useState(null);

  // ── Import state ──────────────────────────────────────────────────────────
  const [importStep, setImportStep] = useState(null);
  const [jogosApi, setJogosApi] = useState([]);
  const [selecionados, setSelecionados] = useState({});
  const [importValorPalpite, setImportValorPalpite] = useState(5);
  const [importPremio, setImportPremio] = useState(100);
  const [importMsg, setImportMsg] = useState('');

  // ── Criar Rodada Mestre state ─────────────────────────────────────────────
  const [novaRodada, setNovaRodada] = useState({ titulo: '', campeonato: 'Brasileirão Série A', valor_cartela: 10, valor_premio: 500 });
  const [jogosRodada, setJogosRodada] = useState([{ time_casa: '', time_fora: '', data_hora: '' }]);
  const [criandoRodada, setCriandoRodada] = useState(false);
  const [rodadaMsg, setRodadaMsg] = useState('');

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
      await axios.post(`${API}/admin/jogos`, { ...novoJogo, data_hora: new Date(novoJogo.data_hora).toISOString() });
      setMsg('✅ Jogo criado!');
      setNovoJogo({ time_casa:'',time_fora:'',campeonato:'',data_hora:'',valor_palpite:5,premio_fixo:100 });
      load();
    } catch(e) { setMsg('❌ ' + (e.response?.data?.detail || 'Erro')); }
  };

  const lancarResultado = async () => {
    try {
      await axios.post(`${API}/admin/jogos/${resultado.jogo_id}/resultado`, { gols_casa: resultado.gols_casa, gols_fora: resultado.gols_fora });
      setMsg('✅ Resultado lançado!');
      load();
    } catch(e) { setMsg('❌ ' + (e.response?.data?.detail || 'Erro')); }
  };

  const salvarEdicao = async () => {
    if (!jogoEditando) return;
    try {
      await axios.put(`${API}/admin/jogos/${jogoEditando.id}`, {
        time_casa: jogoEditando.time_casa,
        time_fora: jogoEditando.time_fora,
        campeonato: jogoEditando.campeonato,
        data_hora: new Date(jogoEditando.data_hora).toISOString(),
        valor_palpite: jogoEditando.valor_palpite,
        premio_fixo: jogoEditando.premio_fixo,
        logo_casa: jogoEditando.logo_casa || null,
        logo_fora: jogoEditando.logo_fora || null,
      });
      setMsg('✅ Jogo atualizado!');
      setJogoEditando(null);
      load();
    } catch(e) { setMsg('❌ ' + (e.response?.data?.detail || 'Erro ao salvar')); }
  };

  // ── Import handlers ───────────────────────────────────────────────────────
  const buscarJogosApi = async () => {
    setImportStep('loading'); setImportMsg(''); setJogosApi([]); setSelecionados({});
    try {
      console.log('[Admin] Buscando jogos do Brasileirão...');
      const r = await axios.get(`${API}/admin/buscar-jogos-semana`, { timeout: 15000 });
      console.log('[Admin] Resposta:', r.data);
      const events = r.data?.events || [];
      const lista = events.map(ev => ({
        fixture_api_id: ev.idEvent,
        time_casa: ev.strHomeTeam,
        time_fora: ev.strAwayTeam,
        campeonato: ev.strLeague,
        data_hora: ev.strTimestamp,
      }));
      console.log(`[Admin] ${lista.length} jogo(s) encontrado(s)`);
      setJogosApi(lista);
      const sel = {};
      lista.forEach((_, i) => { sel[i] = true; });
      setSelecionados(sel);
      if (lista.length === 0) setImportMsg('⚠️ Nenhum jogo encontrado no Brasileirão no momento');
      setImportStep('lista');
    } catch(e) {
      console.error('[Admin] Erro ao buscar TheSportsDB:', e);
      const msg = e.response?.data?.message || e.message || 'Erro ao buscar jogos';
      setImportMsg(`❌ ${msg}. Verifique o console para detalhes.`);
      setImportStep(null);
    }
  };

  // ── Criar Rodada Mestre ───────────────────────────────────────────────────
  const criarRodadaMestre = async () => {
    if (!novaRodada.titulo.trim()) { setRodadaMsg('⚠️ Informe o título da rodada'); return; }
    const jogosValidos = jogosRodada.filter(j => j.time_casa.trim() && j.time_fora.trim() && j.data_hora);
    if (jogosValidos.length < 2) { setRodadaMsg('⚠️ Preencha pelo menos 2 jogos completos'); return; }
    setCriandoRodada(true); setRodadaMsg('');
    try {
      // 1. Cria o desafio
      const r = await axios.post(`${API}/admin/desafios`, {
        titulo: novaRodada.titulo,
        campeonato: novaRodada.campeonato,
        data_hora: new Date(jogosValidos[0].data_hora).toISOString(),
        valor_cartela: novaRodada.valor_cartela,
        valor_premio: novaRodada.valor_premio,
      });
      const desafio_id = r.data.id;
      // 2. Adiciona cada jogo ao desafio
      for (let i = 0; i < jogosValidos.length; i++) {
        const j = jogosValidos[i];
        await axios.post(`${API}/admin/desafios/jogo`, {
          desafio_id,
          ordem: i + 1,
          time_casa: j.time_casa,
          time_fora: j.time_fora,
          data_hora: new Date(j.data_hora).toISOString(),
        });
      }
      setRodadaMsg(`✅ Rodada criada com ${jogosValidos.length} jogo(s)!`);
      setNovaRodada({ titulo: '', campeonato: 'Brasileirão Série A', valor_cartela: 10, valor_premio: 500 });
      setJogosRodada([{ time_casa: '', time_fora: '', data_hora: '' }]);
      load();
    } catch(e) {
      setRodadaMsg('❌ ' + (e.response?.data?.detail || 'Erro ao criar rodada'));
    } finally {
      setCriandoRodada(false);
    }
  };

  const addJogoRodada = () => setJogosRodada(js => [...js, { time_casa: '', time_fora: '', data_hora: '' }]);
  const removeJogoRodada = (i) => setJogosRodada(js => js.filter((_, idx) => idx !== i));
  const updateJogoRodada = (i, field, val) => setJogosRodada(js => js.map((j, idx) => idx === i ? { ...j, [field]: val } : j));

  const confirmarImportacao = async () => {
    const selecionadosList = jogosApi.filter((_, i) => selecionados[i]);
    if (selecionadosList.length === 0) { setImportMsg('⚠️ Selecione ao menos um jogo'); return; }
    setImportStep('importando'); setImportMsg('');
    try {
      const r = await axios.post(`${API}/admin/jogos/importar/confirmar`, {
        jogos: selecionadosList.map(j => ({
          fixture_api_id: j.fixture_api_id,
          time_casa: j.time_casa, time_fora: j.time_fora,
          campeonato: j.campeonato, data_hora: j.data_hora,
          valor_palpite: importValorPalpite, premio_fixo: importPremio,
          logo_casa: j.logo_casa || null,
          logo_fora: j.logo_fora || null,
        })),
      });
      setMsg(`✅ ${r.data.criados} jogo(s) importado(s) com sucesso!`);
      setImportStep(null); setJogosApi([]); load();
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

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', minHeight: 44, fontFamily: 'inherit' };
  const labelStyle = { fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4 };

  if (loading) return <div className="loading-full"><div className="spinner"></div></div>;

  const EditModal = () => {
    if (!jogoEditando) return null;
    const set = (k, v) => setJogoEditando(j => ({ ...j, [k]: v }));
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>✏️ Editar Jogo #{jogoEditando.id}</h3>
            <button onClick={() => setJogoEditando(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', lineHeight: 1 }}>×</button>
          </div>
          {[['time_casa','Time Casa'],['time_fora','Time Fora'],['campeonato','Campeonato']].map(([k,l]) => (
            <div style={{ marginBottom: 12 }} key={k}>
              <label style={labelStyle}>{l}</label>
              <input value={jogoEditando[k] || ''} onChange={e => set(k, e.target.value)} style={inputStyle} />
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Data e Hora</label>
            <input type="datetime-local" value={jogoEditando.data_hora || ''} onChange={e => set('data_hora', e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Valor palpite (R$)</label>
              <input type="number" value={jogoEditando.valor_palpite || 0} onChange={e => set('valor_palpite', parseFloat(e.target.value)||0)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Prêmio (R$)</label>
              <input type="number" value={jogoEditando.premio_fixo || 0} onChange={e => set('premio_fixo', parseFloat(e.target.value)||0)} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Logo Time Casa (URL)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={jogoEditando.logo_casa || ''} onChange={e => set('logo_casa', e.target.value)} placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
              {jogoEditando.logo_casa && <img src={jogoEditando.logo_casa} alt="" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Logo Time Fora (URL)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={jogoEditando.logo_fora || ''} onChange={e => set('logo_fora', e.target.value)} placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
              {jogoEditando.logo_fora && <img src={jogoEditando.logo_fora} alt="" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={salvarEdicao} style={{ flex: 1, background: '#0D1B2A', color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 48 }}>
              💾 Salvar Alterações
            </button>
            <button onClick={() => setJogoEditando(null)} style={{ background: 'transparent', color: '#888', border: '1px solid #e0e0e0', borderRadius: 12, padding: '13px 18px', fontSize: 14, cursor: 'pointer', minHeight: 48 }}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1.5rem 0 3rem' }}>
      <EditModal />
      <style>{css}</style>
      <div className="container">
        <h1 style={{ fontSize: 32, marginBottom: '1.25rem', fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>
          ⚙ Painel Admin
        </h1>

        <div className="admin-tabs">
          {['dashboard','jogos','usuarios'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44,
              background: tab===t ? '#0D1B2A' : 'white',
              color: tab===t ? 'white' : '#555',
              border: tab===t ? 'none' : '1px solid #e0e0e0',
            }}>
              {t === 'dashboard' ? '📊 Dashboard' : t === 'jogos' ? '⚽ Jogos' : '👥 Usuários'}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ background: msg.startsWith('✅') ? '#e6fff3' : '#fef2f2', border: `1px solid ${msg.startsWith('✅') ? '#c6edd9' : '#fca5a5'}`, color: msg.startsWith('✅') ? '#00C16A' : '#dc2626', borderRadius: 10, padding: '12px 16px', marginBottom: '1rem', fontWeight: 600, fontSize: 14 }}>
            {msg}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12 }}>
            {[
              ['Usuários',stats.total_users,'👥'],
              ['Palpites',stats.total_palpites,'🎯'],
              ['Cartelas',stats.total_cartelas,'✨'],
              ['Receita',`R$ ${stats.receita_total?.toFixed(2)}`,'💰'],
              ['Jogos Abertos',stats.jogos_abertos,'⚽'],
              ['Desafios',stats.desafios_abertos,'🏆'],
            ].map(([label,val,icon]) => (
              <div key={label} style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#00C16A' }}>{val}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── JOGOS ── */}
        {tab === 'jogos' && (
          <div>
            {/* Importar */}
            <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: '1.5rem', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: importStep ? '1rem' : 0, gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 2 }}>🔄 Importar Jogos Automático</h3>
                  {!importStep && (
                    <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Busca próximos jogos do Brasileirão Série A via TheSportsDB</p>
                  )}
                </div>
                {!importStep && (
                  <button onClick={buscarJogosApi} style={{ background: 'linear-gradient(135deg,#00C16A,#00a857)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 3px 12px rgba(0,193,106,0.3)', minHeight: 44 }}>
                    🔄 Buscar Jogos da Semana
                  </button>
                )}
              </div>

              {importStep === 'loading' && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                  Buscando jogos do Brasileirão...
                </div>
              )}

              {(importStep === 'lista' || importStep === 'importando') && (
                <>
                  {importMsg && (
                    <div style={{ background: '#fffbeb', border: '1px solid #ffe082', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: '1rem' }}>
                      {importMsg}
                    </div>
                  )}

                  {jogosApi.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#888', fontSize: 14 }}>
                      Nenhum jogo encontrado para as próximas 7 dias nas ligas selecionadas.
                    </div>
                  ) : (
                    <>
                      <div className="admin-import-cfg">
                        <div>
                          <label style={labelStyle}>Valor palpite (R$)</label>
                          <input type="number" min="1" value={importValorPalpite} onChange={e => setImportValorPalpite(parseFloat(e.target.value)||5)} style={{ ...inputStyle, width: 110 }} />
                        </div>
                        <div>
                          <label style={labelStyle}>Prêmio fixo (R$)</label>
                          <input type="number" min="0" value={importPremio} onChange={e => setImportPremio(parseFloat(e.target.value)||0)} style={{ ...inputStyle, width: 130 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => toggleTodos(true)} style={{ background: '#f0f9f4', color: '#00C16A', border: '1px solid #c6edd9', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>
                            Sel. tudo
                          </button>
                          <button onClick={() => toggleTodos(false)} style={{ background: '#fafafa', color: '#888', border: '1px solid #e0e0e0', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>
                            Desmarcar
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem', maxHeight: 320, overflowY: 'auto' }}>
                        {jogosApi.map((j, i) => (
                          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: selecionados[i] ? '#f0f9f4' : '#fafafa', border: `1px solid ${selecionados[i] ? '#c6edd9' : '#eee'}`, minHeight: 48 }}>
                            <input type="checkbox" checked={!!selecionados[i]} onChange={e => setSelecionados(s => ({...s, [i]: e.target.checked}))} style={{ width: 18, height: 18, accentColor: '#00C16A', flexShrink: 0 }} />
                            {j.logo_casa && <img src={j.logo_casa} alt="" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>
                                {j.time_casa} <span style={{ color: '#ccc' }}>×</span> {j.time_fora}
                              </div>
                              <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>
                                {j.campeonato} · {new Date(j.data_hora).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                              </div>
                            </div>
                            {j.logo_fora && <img src={j.logo_fora} alt="" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />}
                          </label>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={confirmarImportacao}
                          disabled={importStep === 'importando' || numSelecionados === 0}
                          style={{ background: numSelecionados === 0 ? '#aaa' : '#0D1B2A', color: 'white', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: numSelecionados === 0 ? 'not-allowed' : 'pointer', minHeight: 48 }}
                        >
                          {importStep === 'importando' ? '⏳ Importando...' : `✅ Importar ${numSelecionados} jogo(s)`}
                        </button>
                        <button onClick={() => { setImportStep(null); setJogosApi([]); setImportMsg(''); }} style={{ background: 'transparent', color: '#888', border: '1px solid #e0e0e0', borderRadius: 12, padding: '12px 18px', fontSize: 14, cursor: 'pointer', minHeight: 48 }}>
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Criar Rodada Mestre */}
            <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: '1.5rem', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>🏆 Criar Rodada Mestre (Bolsão Pix)</h3>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 1rem' }}>Cria um desafio com múltiplos jogos — usuários apostam em todos os placares</p>

              {rodadaMsg && (
                <div style={{ background: rodadaMsg.startsWith('✅') ? '#e6fff3' : '#fef2f2', border: `1px solid ${rodadaMsg.startsWith('✅') ? '#c6edd9' : '#fca5a5'}`, color: rodadaMsg.startsWith('✅') ? '#00C16A' : '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: '1rem' }}>
                  {rodadaMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Título da Rodada</label>
                  <input value={novaRodada.titulo} onChange={e => setNovaRodada(r => ({...r, titulo: e.target.value}))} placeholder="Ex: Rodada 17 — Brasileirão" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Campeonato</label>
                  <input value={novaRodada.campeonato} onChange={e => setNovaRodada(r => ({...r, campeonato: e.target.value}))} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Valor cartela (R$)</label>
                    <input type="number" min="1" value={novaRodada.valor_cartela} onChange={e => setNovaRodada(r => ({...r, valor_cartela: parseFloat(e.target.value)||10}))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Bolsão Pix (R$)</label>
                    <input type="number" min="0" value={novaRodada.valor_premio} onChange={e => setNovaRodada(r => ({...r, valor_premio: parseFloat(e.target.value)||0}))} style={inputStyle} />
                  </div>
                </div>
              </div>

              <label style={{ ...labelStyle, marginBottom: 8 }}>Jogos da Rodada ({jogosRodada.length})</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {jogosRodada.map((j, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, alignItems: 'end', background: '#fafafa', borderRadius: 10, padding: '10px 12px', border: '1px solid #eee' }}>
                    <div>
                      <label style={labelStyle}>Time Casa</label>
                      <input value={j.time_casa} onChange={e => updateJogoRodada(i, 'time_casa', e.target.value)} placeholder="Ex: Flamengo" style={{ ...inputStyle, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Time Fora</label>
                      <input value={j.time_fora} onChange={e => updateJogoRodada(i, 'time_fora', e.target.value)} placeholder="Ex: Palmeiras" style={{ ...inputStyle, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Data/Hora</label>
                      <input type="datetime-local" value={j.data_hora} onChange={e => updateJogoRodada(i, 'data_hora', e.target.value)} style={{ ...inputStyle, fontSize: 13 }} />
                    </div>
                    <button onClick={() => removeJogoRodada(i)} disabled={jogosRodada.length === 1} style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 8, padding: '0 10px', fontSize: 16, cursor: jogosRodada.length === 1 ? 'not-allowed' : 'pointer', minHeight: 44, opacity: jogosRodada.length === 1 ? 0.4 : 1 }}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={addJogoRodada} style={{ background: '#f0f9f4', color: '#00C16A', border: '1px solid #c6edd9', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>
                  + Adicionar Jogo
                </button>
                <button onClick={criarRodadaMestre} disabled={criandoRodada} style={{ background: criandoRodada ? '#aaa' : 'linear-gradient(135deg,#FFB800,#ff8f00)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: criandoRodada ? 'not-allowed' : 'pointer', boxShadow: criandoRodada ? 'none' : '0 3px 12px rgba(255,184,0,0.3)', minHeight: 44 }}>
                  {criandoRodada ? '⏳ Criando...' : '🏆 Criar Rodada Mestre'}
                </button>
              </div>
            </div>

            {/* Criar + Resultado */}
            <div className="admin-2col">
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: '1rem' }}>➕ Criar Jogo Manual</h3>
                <div style={{ background: 'white', borderRadius: 14, padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                  {[['time_casa','Time Casa'],['time_fora','Time Fora'],['campeonato','Campeonato']].map(([k,l]) => (
                    <div style={{ marginBottom: 12 }} key={k}>
                      <label style={labelStyle}>{l}</label>
                      <input value={novoJogo[k]} onChange={e => setNovoJogo(j => ({...j,[k]:e.target.value}))} style={inputStyle} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Data e Hora</label>
                    <input type="datetime-local" value={novoJogo.data_hora} onChange={e => setNovoJogo(j => ({...j,data_hora:e.target.value}))} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Valor palpite (R$)</label>
                      <input type="number" value={novoJogo.valor_palpite} onChange={e => setNovoJogo(j => ({...j,valor_palpite:parseFloat(e.target.value)}))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Prêmio (R$)</label>
                      <input type="number" value={novoJogo.premio_fixo} onChange={e => setNovoJogo(j => ({...j,premio_fixo:parseFloat(e.target.value)}))} style={inputStyle} />
                    </div>
                  </div>
                  <button onClick={criarJogo} style={{ width: '100%', background: '#0D1B2A', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 48 }}>
                    Criar Jogo
                  </button>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '1.5rem 0 1rem' }}>🏁 Lançar Resultado</h3>
                <div style={{ background: 'white', borderRadius: 14, padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Selecionar Jogo</label>
                    <select value={resultado.jogo_id} onChange={e => setResultado(r => ({...r,jogo_id:e.target.value}))} style={inputStyle}>
                      <option value="">Selecione...</option>
                      {jogos.filter(j => j.status==='aberto').map(j => (
                        <option key={j.id} value={j.id}>{j.time_casa} × {j.time_fora}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Gols Casa</label>
                      <input type="number" min="0" value={resultado.gols_casa} onChange={e => setResultado(r => ({...r,gols_casa:parseInt(e.target.value)||0}))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Gols Fora</label>
                      <input type="number" min="0" value={resultado.gols_fora} onChange={e => setResultado(r => ({...r,gols_fora:parseInt(e.target.value)||0}))} style={inputStyle} />
                    </div>
                  </div>
                  <button onClick={lancarResultado} disabled={!resultado.jogo_id} style={{ width: '100%', background: resultado.jogo_id ? '#FFB800' : '#ccc', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: resultado.jogo_id ? 'pointer' : 'not-allowed', minHeight: 48 }}>
                    Lançar Resultado
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: '1rem' }}>⚽ Jogos ({jogos.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {jogos.map(j => (
                    <div key={j.id} style={{ background: 'white', borderRadius: 12, padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #eee', fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                          {j.logo_casa && <img src={j.logo_casa} alt="" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />}
                          <strong style={{ fontSize: 13 }}>{j.time_casa} × {j.time_fora}</strong>
                          {j.logo_fora && <img src={j.logo_fora} alt="" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: j.status==='aberto' ? '#e6fff3' : '#f5f5f5', color: j.status==='aberto' ? '#00C16A' : '#888', border: `1px solid ${j.status==='aberto' ? '#c6edd9' : '#e0e0e0'}`, whiteSpace: 'nowrap' }}>
                            {j.status}
                          </span>
                          <button onClick={() => setJogoEditando({ ...j, data_hora: j.data_hora.slice(0,16) })} style={{ background: '#f0f4ff', color: '#4466ee', border: '1px solid #c8d4ff', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            ✏️ Editar
                          </button>
                        </div>
                      </div>
                      <div style={{ color: '#888', marginTop: 4, fontSize: 12 }}>
                        {j.campeonato} · {j.total_palpites} palpites · R$ {j.premio_fixo}
                      </div>
                      <div style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>
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
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ background: '#0D1B2A', color: 'white', fontSize: 12 }}>
                  {['#','Nome','Email','Admin','Cadastro'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid #f0f0f0', fontSize: 13 }}>
                    <td style={{ padding: '11px 14px', color: '#aaa' }}>{u.id}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 500 }}>{u.nome}</td>
                    <td style={{ padding: '11px 14px', color: '#888', fontSize: 12 }}>{u.email}</td>
                    <td style={{ padding: '11px 14px' }}>
                      {u.is_admin
                        ? <span style={{ background: '#fffbeb', color: '#FFB800', border: '1px solid #ffe082', borderRadius: 20, fontSize: 11, padding: '2px 10px', fontWeight: 600 }}>Admin</span>
                        : <span style={{ background: '#f5f5f5', color: '#888', border: '1px solid #e0e0e0', borderRadius: 20, fontSize: 11, padding: '2px 10px', fontWeight: 600 }}>User</span>
                      }
                    </td>
                    <td style={{ padding: '11px 14px', color: '#aaa', fontSize: 12 }}>
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
