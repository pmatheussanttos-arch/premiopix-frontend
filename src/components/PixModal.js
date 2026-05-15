import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export default function PixModal({ pagamento, onClose, onConfirmed }) {
  const [status, setStatus] = useState('pending');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pagamento?.payment_id) return;
    const interval = setInterval(async () => {
      try {
        const r = await axios.get(`${API}/pagamentos/status/${pagamento.payment_id}`);
        if (r.data.status === 'approved') {
          setStatus('approved');
          clearInterval(interval);
          setTimeout(() => onConfirmed(), 1500);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [pagamento]);

  const copiar = () => {
    navigator.clipboard.writeText(pagamento.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pix-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pix-modal">
        {status === 'approved' ? (
          <div>
            <div style={{fontSize:48,marginBottom:'1rem'}}>✅</div>
            <h3 style={{fontFamily:"'Bebas Neue'",fontSize:28,color:'var(--green)'}}>Pagamento Confirmado!</h3>
            <p style={{color:'var(--muted)',marginTop:'0.5rem'}}>Sua aposta foi registrada com sucesso.</p>
          </div>
        ) : (
          <>
            <h3 style={{fontFamily:"'Bebas Neue'",fontSize:26,marginBottom:'0.5rem'}}>Pague via PIX</h3>
            <p style={{color:'var(--muted)',fontSize:14,marginBottom:'1rem'}}>
              Escaneie o QR code ou copie o código PIX
            </p>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:'var(--green)',marginBottom:'1rem'}}>
              R$ {pagamento?.valor?.toFixed(2).replace('.', ',')}
            </div>
            <div className="pix-qr-box">
              {pagamento?.qr_code_base64 ? (
                <img src={`data:image/png;base64,${pagamento.qr_code_base64}`} alt="QR Code PIX" />
              ) : (
                <div style={{width:180,height:180,background:'var(--border)',borderRadius:8,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontSize:13}}>
                  QR Code
                </div>
              )}
            </div>
            <div className="pix-copy" onClick={copiar}>
              {copied ? '✅ Copiado!' : '📋 Clique para copiar o código PIX'}
              <div style={{fontSize:11,color:'var(--muted)',marginTop:4,wordBreak:'break-all'}}>
                {pagamento?.qr_code?.substring(0, 60)}...
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center',marginBottom:'1rem'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',animation:'pulse 1.5s infinite'}}></div>
              <span style={{fontSize:13,color:'var(--muted)'}}>Aguardando pagamento...</span>
            </div>
            <button className="btn btn-outline btn-full" onClick={onClose}>Fechar</button>
          </>
        )}
      </div>
    </div>
  );
}
