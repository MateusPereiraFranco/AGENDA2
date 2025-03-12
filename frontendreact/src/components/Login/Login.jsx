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
        if (response && response.message === 'Login bem-sucedido') {
            const userData = await get_fk_empresa_id(email);
            if (userData) { // Verifica se userData não é null
                localStorage.setItem('tipo_usuario', userData.tipo_usuario);
                localStorage.setItem('id_usuario', userData.id_usuario);
                if (userData.tipo_usuario === 'funcionario') {
                    navigate(`/agenda/${userData.id_usuario}`);
                } else if (userData.tipo_usuario === 'secretario' || userData.tipo_usuario === 'gerente') {
                    navigate(`/usuario/${userData.fk_empresa_id}`);
                } else if (userData.tipo_usuario === 'admin') {
                    navigate(`/empresa`);
                }
            } else {
                setError('Erro ao buscar informações do usuário.');
            }
        } else {
            setError('Erro ao fazer login. Verifique suas credenciais.');
        }
    } catch (err) {
        setError('Erro ao fazer login. Verifique suas credenciais.');
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