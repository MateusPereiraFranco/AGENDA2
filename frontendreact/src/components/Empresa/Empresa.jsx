import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmpresas, addEmpresa, updateEmpresa, deleteEmpresa } from '../../services/api';

function Empresa() {
  const [empresas, setEmpresas] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmpresas();
  }, [currentPage, searchParams]);

  const loadEmpresas = async () => {
    try {
      const data = await fetchEmpresas({ ...searchParams, page: currentPage });
      setEmpresas(data);
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

  const handleSearch = (e) => {
    e.preventDefault();

    const nome = e.target.searchName.value.trim(); // trim Remove espaços em branco
    const cnpj = e.target.searchCnpj.value.trim();

    if (!nome && !cnpj) {
      alert('Por favor, preencha pelo menos um campo (nome ou CNPJ).');
      return;
    }

    const searchParams = {};
    if (nome) searchParams.nome = nome;
    if (cnpj) searchParams.cnpj = cnpj;

    setSearchParams(searchParams);
  };

  return (
    <div>
      <h1>Lista de Empresas</h1>
      <form onSubmit={handleSearch}>
        <input type="text" name="searchName" placeholder="Nome da Empresa" />
        <input type="text" name="searchCnpj" placeholder="CNPJ" />
        <button type="submit">Buscar</button>
      </form>
      <form onSubmit={handleAddEmpresa}>
        <input type="text" name="name" placeholder="Nome da Empresa" required />
        <input type="text" name="cnpj" placeholder="CNPJ" required />
        <input type="text" name="email" placeholder="Email" required />
        <button type="submit">Adicionar Empresa</button>
      </form>
      <ul>
        {empresas.map((empresa) => (
          <li key={empresa.id_empresa}>
            {empresa.nome} - {empresa.cnpj} - {empresa.email}
            <button onClick={() => handleDeleteEmpresa(empresa.id_empresa)}>Excluir</button>
            <button onClick={() => handleUpdateEmpresa(empresa.id_empresa)}>Atualizar</button>
            <button onClick={() => handleVerEmpresa(empresa.id_empresa)}>Ver Empresa</button>
          </li>
        ))}
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

export default Empresa;