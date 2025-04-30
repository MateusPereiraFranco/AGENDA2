import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/apiConfig';
import SenhaInput from '../../components/SenhaInput';

function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [tempoRestante, setTempoRestante] = useState(0);
  const [reenviando, setReenviando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const navigate = useNavigate();

  const email = localStorage.getItem('recovery_email');
  const token = localStorage.getItem('recovery_token');
  const expiresAt = parseInt(localStorage.getItem('recovery_expires'), 10);

  const senhasCoincidem = novaSenha === confirmarSenha && novaSenha.length > 0;

  useEffect(() => {
    if (!email || !token || !expiresAt) {
      navigate('/forgot-password');
      return;
    }
  
    const now = Date.now();
    if (now >= expiresAt) {
      localStorage.removeItem('recovery_token');
      navigate('/verify-token');
      return;
    }
  
    const updateTimer = () => {
      const diff = Math.floor((expiresAt - Date.now()) / 1000);
      setTempoRestante(Math.max(diff, 0));
    };
  
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [email, token, expiresAt, navigate]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!senhasCoincidem) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: novaSenha }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSucesso('Senha redefinida com sucesso!');
      localStorage.removeItem('recovery_email');
      localStorage.removeItem('recovery_token');
      localStorage.removeItem('recovery_expires');

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setErro(err.message || 'Erro ao redefinir senha');
    }
  };

  const handleReenviarCodigo = async () => {
    setErro('');
    setMensagem('');
    setReenviando(true);
  
    try {
      const response = await fetch(`${API_URL}/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
  
      const novoExpira = Date.now() + 10 * 60 * 1000;
      localStorage.setItem('recovery_expires', novoExpira);
  
      // Limpar token antigo
      localStorage.removeItem('recovery_token');
  
      // Redirecionar para a verificação de novo código
      navigate('/verify-token');
    } catch (err) {
      setErro(err.message || 'Erro ao reenviar código');
    } finally {
      setReenviando(false);
    }
  };
  

  return (
    <div className='reset_password_conteiner'>
      <h2>Nova Senha</h2>

      {tempoRestante > 0 ? (
        <p>Tempo restante: <strong>{formatTime(tempoRestante)}</strong></p>
      ) : (
        <>
          <p style={{ color: 'orange' }}>Tempo expirado. Solicite um novo código.</p>
          <button className='botao_verde' onClick={handleReenviarCodigo} disabled={reenviando}>
            {reenviando ? 'Reenviando...' : 'Reenviar código'}
          </button>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <SenhaInput
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          placeholder="Nova senha"
          required
        />

        <SenhaInput
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          placeholder="Confirmar nova senha"
          required
        />

        {confirmarSenha && (
          <p style={{ color: senhasCoincidem ? 'green' : 'red' }}>
            {senhasCoincidem
              ? '✔ Senhas coincidem'
              : '✖ As senhas não coincidem'}
          </p>
        )}

        <button
          id='botaoAtuSen'
          className='botao_verde'
          type="submit"
          disabled={tempoRestante <= 0 || !senhasCoincidem}
        >
          Redefinir Senha
        </button>

      </form>

      {sucesso && <p style={{ color: 'green' }}>{sucesso}</p>}
      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default ResetPassword;
