import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmpresas, addEmpresa, updateEmpresa, deleteEmpresa } from '../../services/empresaService';

function Empresa() {
  const [empresas, setEmpresas] = useState([]);
  const [searchParams, setSearchParams] = useState({ nome: '', cnpj: '' }); // Inicializa com campos vazios
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmpresas();
  }, [currentPage, searchParams]);

  const loadEmpresas = async () => {
    try {
      const params = { ...searchParams };
      if (params.cnpj === '') delete params.cnpj;
      if (params.nome === '') delete params.nome;
      params.page = currentPage;
  
      const data = await fetchEmpresas(params);
  
      // Verifica se data é um array antes de usar
      if (Array.isArray(data)) {
        setEmpresas(data);
      } else {
        setEmpresas([]); // Define como array vazio se data não for válido
        console.error('Dados inválidos recebidos:', data);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar empresas');
    }
  };

  const handleAddEmpresa = async (e) => {
    e.preventDefault();
    const nome = e.target.name.value;
    const cnpj = e.target.cnpj.value;
    const email = e.target.email.value;
    try {
      await addEmpresa({ nome, cnpj, email });
      loadEmpresas();
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar empresa');
    }
  };

  const handleDeleteEmpresa = async (id) => {
    try {
      await deleteEmpresa(id);
      loadEmpresas();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir empresa');
    }
  };

  const handleUpdateEmpresa = async (id) => {
    const nome = prompt('Novo nome da empresa:');
    const cnpj = prompt('Novo CNPJ:');
    const email = prompt('Novo email:');
    if (!nome || !cnpj || !email) {
      alert('Todos os campos são obrigatórios!');
      return;
    }
    try {
      await updateEmpresa(id, { nome, cnpj, email });
      loadEmpresas();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar empresa');
    }
  };

  const handleVerEmpresa = (id) => {
    navigate(`/usuario/${id}`);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;

    // Atualiza os parâmetros de busca em tempo real
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value, // Remove espaços em branco e atualiza o campo correspondente
    }));
  };

  return (
    <div className='conteiner_empresas'>
      <h1>Lista de Empresas</h1>
      <form>
        <input
          type="text"
          name="nome"
          placeholder="Nome da Empresa"
          value={searchParams.nome}
          onChange={handleSearchChange} // Busca em tempo real
        />
        <input
          type="text"
          name="cnpj"
          placeholder="CNPJ"
          value={searchParams.cnpj}
          onChange={handleSearchChange} // Busca em tempo real
        />
      </form>
      <form onSubmit={handleAddEmpresa}>
        <input type="text" name="name" placeholder="Nome da Empresa" required />
        <input type="text" name="cnpj" placeholder="CNPJ" required />
        <input type="text" name="email" placeholder="Email" required />
        <button type="submit">Adicionar Empresa</button>
      </form>
      <table>
        <tbody>
          {empresas.length > 0 ? (
            empresas.map((empresa) => (
              <tr key={empresa.id_empresa}>
                <td>{empresa.nome}</td>
                <td>{empresa.cnpj}</td>
                <td>{empresa.email}</td>
                <td>
                  <button onClick={() => handleDeleteEmpresa(empresa.id_empresa)}>Excluir</button>
                  <button onClick={() => handleUpdateEmpresa(empresa.id_empresa)}>Atualizar</button>
                  <button onClick={() => handleVerEmpresa(empresa.id_empresa)}>Ver Empresa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>Nenhuma empresa cadastrada</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <button onClick={() => setCurrentPage(currentPage + 1)}>Próxima</button>
      </div>
    </div>
  );
}

export default Empresa;