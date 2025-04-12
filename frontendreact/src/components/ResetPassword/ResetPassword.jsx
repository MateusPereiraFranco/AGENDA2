// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/apiConfig';

function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      const email = localStorage.getItem('recovery_email');
      const token = localStorage.getItem('recovery_token');

      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: novaSenha }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSucesso('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/'), 2000); // Redireciona para login
    } catch (err) {
      setErro(err.message || 'Erro ao redefinir senha');
    }
  };

  return (
    <div>
      <h2>Nova Senha</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          required
        />
        <button type="submit">Redefinir Senha</button>
      </form>
      {sucesso && <p style={{ color: 'green' }}>{sucesso}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default ResetPassword;
