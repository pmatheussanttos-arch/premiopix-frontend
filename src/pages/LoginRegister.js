import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.detail || 'Erro ao fazer login'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <h1 style={{fontSize:36}}>Entrar</h1>
          <p style={{color:'var(--muted)'}}>Bem-vindo de volta ao PrêmioPIX</p>
        </div>
        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{marginTop:'0.5rem'}} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p style={{textAlign:'center',marginTop:'1rem',fontSize:14,color:'var(--muted)'}}>
            Não tem conta? <Link to="/register" style={{color:'var(--green)',fontWeight:500}}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ nome:'', email:'', password:'', telefone:'', chave_pix:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form.nome, form.email, form.password, form.telefone, form.chave_pix); navigate('/'); }
    catch (err) { setError(err.response?.data?.detail || 'Erro ao cadastrar'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <h1 style={{fontSize:36}}>Criar Conta</h1>
          <p style={{color:'var(--muted)'}}>Comece a concorrer agora mesmo</p>
        </div>
        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group"><label>Nome completo</label>
              <input value={form.nome} onChange={e=>set('nome',e.target.value)} placeholder="João da Silva" required /></div>
            <div className="form-group"><label>E-mail</label>
              <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="seu@email.com" required /></div>
            <div className="form-group"><label>Senha</label>
              <input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Mínimo 6 caracteres" required /></div>
            <div className="form-group"><label>Telefone (WhatsApp)</label>
              <input value={form.telefone} onChange={e=>set('telefone',e.target.value)} placeholder="(31) 99999-9999" /></div>
            <div className="form-group"><label>Chave PIX para receber prêmios</label>
              <input value={form.chave_pix} onChange={e=>set('chave_pix',e.target.value)} placeholder="CPF, e-mail ou telefone" /></div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{marginTop:'0.5rem'}} disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>
          <p style={{textAlign:'center',marginTop:'1rem',fontSize:14,color:'var(--muted)'}}>
            Já tem conta? <Link to="/login" style={{color:'var(--green)',fontWeight:500}}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
