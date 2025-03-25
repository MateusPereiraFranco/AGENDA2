import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get_fk_empresa_id, login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

function Login() {

  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const tipoUsuario = localStorage.getItem('tipo_usuario');
      const idUsuario = localStorage.getItem('id_usuario');
      const fk_empresa_id = localStorage.getItem('fk_empresa_id');

      if (tipoUsuario === 'funcionario') {
        navigate(`/agenda/${idUsuario}`);
      } else if (tipoUsuario === 'secretario' || tipoUsuario === 'gerente') {
        navigate(`/usuario/${fk_empresa_id}`);
      } else if (tipoUsuario === 'admin') {
        navigate('/empresa');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        // 1. Faz login
        const loginResult = await login({ email, senha });
        
        if (!loginResult.success) {
            throw new Error(loginResult.message);
        }

        // 2. Busca dados completos do usuário
        const userData = await get_fk_empresa_id(email);
        
        if (!userData) {
            throw new Error('Dados do usuário não encontrados');
        }

        // 3. Atualiza estado e armazenamento
        setIsAuthenticated(true);
        localStorage.setItem('tipo_usuario', userData.tipo_usuario);
        localStorage.setItem('id_usuario', userData.id_usuario);
        localStorage.setItem('fk_empresa_id', userData.fk_empresa_id);

        // 4. Redireciona
        const redirectPath = {
            'funcionario': `/agenda/${userData.id_usuario}`,
            'secretario': `/usuario/${userData.fk_empresa_id}`,
            'gerente': `/usuario/${userData.fk_empresa_id}`,
            'admin': '/empresa'
        }[userData.tipo_usuario];

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
        <div className="form-group1">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group2">
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;