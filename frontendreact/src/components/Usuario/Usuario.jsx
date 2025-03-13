import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUsuarios, addUsuario, deleteUsuario, updateUsuario } from '../../services/usuarioService';
import { fetchEmpresas } from '../../services/empresaService';

function Usuario() {
  const { id } = useParams();
  const [usuarios, setUsuarios] = useState([]);
  const [searchParams, setSearchParams] = useState({ nome: '' }); // Inicialize com nome vazio
  const [currentPage, setCurrentPage] = useState(1);
  const [empresaNome, setEmpresaNome] = useState('');
  const navigate = useNavigate();
  const tipoUsuario = localStorage.getItem('tipo_usuario'); // Recupera o tipo de usuário

  useEffect(() => {
    loadUsuarios();
    loadEmpresa();
  }, [currentPage, searchParams]);

  const loadUsuarios = async () => {
    try {
      // Cria uma cópia do searchParams para evitar mutação direta
      const params = { ...searchParams };

      // Remove o campo "nome" se estiver vazio
      if (params.nome === '') {
        delete params.nome;
      }

      // Adiciona a página atual aos parâmetros
      params.page = currentPage;

      // Busca os usuários com os parâmetros atualizados
      const data = await fetchUsuarios(id, params);
      if (data) {
        setUsuarios(data);
      } else {
        setUsuarios([]); // Define a lista de usuários como vazia se não houver dados
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar usuários');
    }
  };

  const loadEmpresa = async () => {
    try {
      const empresa = await fetchEmpresas({ id });
      setEmpresaNome(empresa[0].nome);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar detalhes da empresa');
    }
  };

  const handleAddUsuario = async (e) => {
    e.preventDefault();
    const nome = e.target.name.value;
    const email = e.target.email.value;
    const senha = e.target.password.value;
    const tipo_usuario = e.target.tipo_usuario.value;
    try {
      await addUsuario({ nome, email, senha, tipo_usuario, fk_empresa_id: id });
      loadUsuarios();
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar usuário');
    }
  };

  const handleDeleteUsuario = async (id) => {
    try {
      await deleteUsuario(id);
      loadUsuarios();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir usuário');
    }
  };

  const handleUpdateUsuario = async (id) => {
    const nome = prompt('Novo nome do usuário:');
    const email = prompt('Novo email:');
    const tipo_usuario = prompt('Novo tipo de usuário:');
    if (!nome || !email || !tipo_usuario) {
      alert('Todos os campos são obrigatórios!');
      return;
    }
    try {
      await updateUsuario(id, { nome, email, tipo_usuario });
      loadUsuarios();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar usuário');
    }
  };

  const handleVerFuncionario = (id) => {
    navigate(`/agenda/${id}`);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchParams((prevParams) => ({
      ...prevParams,
      nome: value, // Atualiza o campo "nome" no searchParams
    }));
  };

  return (
    <div>
      <h1>{empresaNome}</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Buscar por nome"
          value={searchParams.nome} // Controla o valor do input
          onChange={handleSearchChange} // Atualiza o estado ao digitar
        />
        <button type="submit">Buscar</button>
      </form>
      <form onSubmit={handleAddUsuario}>
        <input type="text" name="name" placeholder="Nome" required />
        <input type="text" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Senha" required />
        <input type="text" name="tipo_usuario" placeholder="Tipo de Usuário" required />
        <button type="submit">Adicionar Funcionário</button>
      </form>
      <ul>
        {usuarios.length > 0 ? (
          usuarios.map((usuario) => (
            <li key={usuario.id_usuario}>
              {usuario.nome} - {usuario.email} - {usuario.tipo_usuario}
              {(tipoUsuario === 'gerente' || tipoUsuario === 'admin')  && (
                <button onClick={() => handleDeleteUsuario(usuario.id_usuario)}>Excluir</button>
              )}
              <button onClick={() => handleUpdateUsuario(usuario.id_usuario)}>Atualizar</button>
              <button onClick={() => handleVerFuncionario(usuario.id_usuario)}>Ver Agenda</button>
            </li>
          ))
        ) : (
          <li>Não há usuários cadastrados</li>
        )}
      </ul>
      <div>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <button onClick={() => setCurrentPage(currentPage + 1)}>Próxima</button>
      </div>
    </div>
  );
}

export default Usuario;