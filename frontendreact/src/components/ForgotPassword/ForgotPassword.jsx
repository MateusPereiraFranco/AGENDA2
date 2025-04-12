import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/apiConfig';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate(); // 👈 necessário

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    try {
      const response = await fetch(`${API_URL}/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMensagem('Código enviado para seu email!');
      
      // 🔐 Armazena email temporariamente e redireciona
      localStorage.setItem('recovery_email', email);
      setTimeout(() => navigate('/verify-token'), 1000); // ⏩ redireciona após 1s

    } catch (err) {
      setErro(err.message || 'Erro ao solicitar recuperação de senha');
    }
  };

  return (
    <div>
      <h2>Esqueci minha senha</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar código</button>
      </form>
      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default ForgotPassword;
