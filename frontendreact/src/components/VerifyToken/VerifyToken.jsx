import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/apiConfig';


function VerifyToken() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await fetch(`${API_URL}/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem('recovery_email', email);
      localStorage.setItem('recovery_token', token);
      navigate('/reset-password');
    } catch (err) {
      setErro(err.message || 'Erro ao verificar código');
    }
  };

  return (
    <div>
      <h2>Verificar Código</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email utilizado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Código recebido"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <button type="submit">Verificar</button>
      </form>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default VerifyToken;
