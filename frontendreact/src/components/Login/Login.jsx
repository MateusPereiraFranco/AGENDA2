import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get_fk_empresa_id, login } from '../../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, senha });
      if (response.token) {
        const userData = await get_fk_empresa_id(email)
        localStorage.setItem('token', response.token);
        console.log(userData.fk_empresa_id)
        if(userData.tipo_usuario === 'funcionario'){
          navigate(`/agenda/${userData.id_usuario}`);
        }
        else if(userData.tipo_usuario === 'secretario' || userData.tipo_usuario === 'gerente'){
          navigate(`/usuario/${userData.fk_empresa_id}`); 
        }
        else if(userData.tipo_usuario === 'admin'){
          navigate(`/empresa`);
        }
      }
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
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