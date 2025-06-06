import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import SenhaInput from '../../components/SenhaInput';

function Login() {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Login.jsx
  useEffect(() => {
    if (isAuthenticated && user) {
      const { tipo_usuario, id_usuario, fk_empresa_id } = user;

      const redirectPath = {
        funcionario: `/agendaHorario/${id_usuario}`,
        secretario: `/usuario/${fk_empresa_id}`,
        gerente: `/usuario/${fk_empresa_id}`,
        admin: '/empresa'
      }[tipo_usuario];

      navigate(redirectPath || '/');
    }
  }, [isAuthenticated, user, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {

      const loginResult = await login({ email, senha });

      if (!loginResult.success) {
        throw new Error(loginResult.message);
      }

      const userCompleto = loginResult.user;

      // ✅ Salva no contexto o user completo
      setIsAuthenticated(true);
      setUser(userCompleto);

      const redirectPath = {
        funcionario: `/agendaHorario/${userCompleto.id_usuario}`,
        secretario: `/usuario/${userCompleto.fk_empresa_id}`,
        gerente: `/usuario/${userCompleto.fk_empresa_id}`,
        admin: '/empresa'
      }[userCompleto.tipo_usuario];

      navigate(redirectPath || '/');
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=''
            required
            id="email"
          />
          <label htmlFor="email" className={email ? "floating" : ""}>E-mail</label>
        </div>
        <div className="input-container">
          <SenhaInput
            name='Senha'
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder=''
            required
            id="senha"
          />

        </div>
        <button id='botaoAtuSen' className="botao_verde" type="submit">Entrar</button>
      </form>

      <div>
        <button
          id='botaoAtuSen'
          className='botao_esqueciSenha'
          onClick={() => navigate('/forgot-password')}
        >
          Esqueci minha senha
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;
