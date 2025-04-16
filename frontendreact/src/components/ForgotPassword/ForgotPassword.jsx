import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/apiConfig';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [isSending, setIsSending] = useState(false); // 👈 novo estado
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setIsSending(true);
  
    try {
      const response = await fetch(`${API_URL}/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
  
      setMensagem('Código enviado para seu email!');
      const expiresAt = Date.now() + 10 * 60 * 1000;
      localStorage.setItem('recovery_expires', expiresAt);
      localStorage.setItem('recovery_email', email);
  
      // 👉 não reabilita o botão, pois vai redirecionar
      setTimeout(() => {
        navigate('/verify-token');
      }, 1000);
    } catch (err) {
      setErro(err.message || 'Erro ao solicitar recuperação de senha');
      setIsSending(false); // ✅ só reabilita se der erro
    }
  };
  

  return (
    <div className='forgot_password_conteiner'>
      <h2>Esqueci minha senha</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="botao_verde" type="submit" disabled={isSending}>
          {isSending ? 'Enviando...' : 'Enviar código'}
        </button>
      </form>
      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default ForgotPassword;
