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

  const navigate = useNavigate();

  const email = localStorage.getItem('recovery_email');
  const token = localStorage.getItem('recovery_token');
  const expiresAt = parseInt(localStorage.getItem('recovery_expires'), 10);

  const senhasCoincidem = novaSenha === confirmarSenha && novaSenha.length > 0;

  useEffect(() => {
    if (!email || !token) {
      navigate('/forgot-password');
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

  return (
    <div>
      <h2>Nova Senha</h2>

      {tempoRestante > 0 ? (
        <p>Tempo restante: <strong>{formatTime(tempoRestante)}</strong></p>
      ) : (
        <p style={{ color: 'orange' }}>
          O tempo para redefinir a senha expirou. Solicite um novo código.
        </p>
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
          type="submit"
          disabled={tempoRestante <= 0 || !senhasCoincidem}
        >
          Redefinir Senha
        </button>
      </form>

      {sucesso && <p style={{ color: 'green' }}>{sucesso}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default ResetPassword;
