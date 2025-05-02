import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//icons
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import EditOffIcon from '@mui/icons-material/EditOff';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  fetchEmpresas,
  addEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../../services/empresaService";

// ...imports mantidos...

function Empresa() {
  const [empresas, setEmpresas] = useState([]);
  const [searchParams, setSearchParams] = useState({ nome: "", cnpj: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [editingEmpresaId, setEditingEmpresaId] = useState(null); // <- apenas ID
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const [hasMorePages, setHasMorePages] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEmpresas();
  }, [currentPage, searchParams]);

  const loadEmpresas = async () => {
    try {
      const params = { ...searchParams };
      if (params.cnpj === "") delete params.cnpj;
      if (params.nome === "") delete params.nome;
      params.page = currentPage;

      const data = await fetchEmpresas(params);

      if (Array.isArray(data)) {
        setEmpresas(data);
      } else {
        setEmpresas([]);
      }

      setHasMorePages(data.length >= itemsPerPage);
    } catch (error) {
      setHasMorePages(false);
      console.error(error);
    }
  };

  const toggleEditingEmpresa = (id) => {
    setEditingEmpresaId(prevId => prevId === id ? null : id);
  };

  const handleAddEmpresa = async (e) => {
    e.preventDefault();
    const nome = e.target.name.value;
    const cnpj = e.target.cnpj.value;
    const email = e.target.email.value;
    try {
      await addEmpresa({ nome, cnpj, email });
      loadEmpresas();
      e.target.name.value = "";
      e.target.cnpj.value = "";
      e.target.email.value = "";
      setError('');
      toast.success(`Empresa ${nome} cadastrada com sucesso!`);
    } catch (error) {
      setError(error.message); 
      toast.error(error.message);
    }
  };

  const handleDeleteEmpresa = async (id, nome) => {
    if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return;

    setDeletingId(id);
    try {
      await deleteEmpresa(id);
      await loadEmpresas();
      toast.success(`Empresa ${nome} excluída`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir empresa");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateEmpresa = async (e) => {
    e.preventDefault();
    const nome = e.target.nome.value;
    const cnpj = e.target.cnpj.value;
    const email = e.target.email.value;

    if (!nome || !cnpj || !email) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    try {
      await updateEmpresa(editingEmpresaId, { nome, cnpj, email });
      loadEmpresas();
      setEditingEmpresaId(null);
      setError('');
      toast.success(`Empresa ${nome} atualizada com sucesso!`);
    } catch (error) {
      console.error(error);
      setError(error.message); 
      toast.error(error.message);
    }
  };

  const handleVerEmpresa = (id) => {
    navigate(`/usuario/${id}`);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  return (
    <div className="conteiner_empresas_geral">
      <ToastContainer autoClose={1500} pauseOnHover={false} pauseOnFocusLoss={false} />
      <h1>TEM UM HORÁRIO</h1>

      <div className="form_empresa">
        <form>
          <input
            type="text"
            name="nome"
            placeholder="Nome da Empresa"
            value={searchParams.nome}
            onChange={handleSearchChange}
          />
          <input
            type="text"
            name="cnpj"
            placeholder="CNPJ"
            value={searchParams.cnpj}
            onChange={handleSearchChange}
          />
        </form>
        <hr />
        <form onSubmit={handleAddEmpresa}>
          <input type="text" name="name" placeholder="Nome da Empresa" required />
          <input type="text" name="cnpj" placeholder="CNPJ" required />
          <input type="text" name="email" placeholder="Email" required />
          <button className="botao_verde" type="submit">Adicionar Empresa</button>
        </form>
      </div>

      <hr />
      <h2>EMPRESAS</h2>
      <hr />

      <div className="tabela_empresa">
        <table>
          <tbody>
            {empresas.length > 0 ? (
              empresas.map((empresa) => (
                <React.Fragment key={empresa.id_empresa}>
                  <tr>
                    <td>{empresa.nome}</td>
                    <td>{empresa.cnpj}</td>
                    <td>{empresa.email}</td>
                    <td className="botaoNoCanto">
                      <button
                        className="botao-vermelho"
                        onClick={() => handleDeleteEmpresa(empresa.id_empresa, empresa.nome)}
                        disabled={deletingId === empresa.id_empresa}
                      >
                        {deletingId === empresa.id_empresa ? <RotateRightIcon className="loading" /> : <DeleteIcon />}
                      </button>
                      <button 
                        className="botao_azul"
                        onClick={() => toggleEditingEmpresa(empresa.id_empresa)}
                      >
                        {editingEmpresaId === empresa.id_empresa ? <EditOffIcon /> : <BorderColorIcon />}
                      </button>
                      <button
                        className="botao_verde"
                        onClick={() => handleVerEmpresa(empresa.id_empresa)}
                      >
                        <KeyboardArrowRightIcon className="seta_icon" />
                      </button>
                    </td>
                  </tr>

                  {editingEmpresaId === empresa.id_empresa && (
                    <tr>
                      <td colSpan="4">
                        <h2>Editar Empresa</h2>
                        <div className="edit-empresa-form">
                          <form className="form-atualizacao" onSubmit={handleUpdateEmpresa}>
                            <label htmlFor="nome">Nome:</label>
                            <input
                              type="text"
                              id="nome"
                              name="nome"
                              defaultValue={empresa.nome}
                              required
                            />
                            <label htmlFor="cnpj">CNPJ:</label>
                            <input
                              type="text"
                              id="cnpj"
                              name="cnpj"
                              defaultValue={empresa.cnpj}
                              required
                            />
                            <label htmlFor="email">Email:</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              defaultValue={empresa.email}
                              required
                            />
                            <br />
                            <div className="form-atualizacao_botao">
                              <button type="submit" className="botao_verde">
                                <CheckIcon />
                              </button>
                              <button
                                type="button"
                                className="botao-vermelho"
                                onClick={() => setEditingEmpresaId(null)}
                              >
                                <CloseIcon />
                              </button>
                            </div>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Nenhuma empresa cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="vai_volta">
        <button
          className="botao_verde"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <KeyboardArrowLeftIcon className="seta_icon" />
        </button>
        <button 
          className="botao_verde"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={!hasMorePages}
        >
          <KeyboardArrowRightIcon className="seta_icon" />
        </button>
      </div>
    </div>
  );
}

export default Empresa;

