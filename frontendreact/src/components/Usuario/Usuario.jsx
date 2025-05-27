import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchUsuarios,
  addUsuario,
  deleteUsuario,
  updateUsuario,
} from "../../services/usuarioService";
import { fetchEmpresaNome } from "../../services/empresaService";

//icons
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AddIcon from "@mui/icons-material/Add";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import EditOffIcon from "@mui/icons-material/EditOff";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext";

function Usuario() {
  const { user } = useAuth();
  const { tipo_usuario } = user || {};
  const { id } = useParams() || {};
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [searchParams, setSearchParams] = useState({
    nome: "",
    tipo_usuario: "",
    sortBy: "tipo_usuario, nome",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [empresaNome, setEmpresaNome] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const toggleShowFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const itemsPerPage = 10;

  useEffect(() => {
    loadUsuarios();
    loadEmpresa();
  }, [currentPage, searchParams]);

  const loadUsuarios = async () => {
    try {
      const params = { ...searchParams };
      if (params.nome === "") delete params.nome;
      if (params.tipo_usuario === "") delete params.tipo_usuario;
      params.page = currentPage;

      const data = await fetchUsuarios(id, params);
      if (data) {
        const ordem = { gerente: 1, funcionario: 2, secretario: 3 };
        setUsuarios(
          data.sort((a, b) => ordem[a.tipo_usuario] - ordem[b.tipo_usuario])
        );
        setError("");
      } else {
        setUsuarios([]);
        setError("Nenhum usuário cadastrado.");
      }
      setHasMorePages(data.length >= itemsPerPage);
    } catch (error) {
      setHasMorePages(false);
      setUsuarios([]);
    }
  };

  const loadEmpresa = async () => {
    try {
      const nomeEmpresa = await fetchEmpresaNome(id);
      setEmpresaNome(nomeEmpresa || "Empresa não encontrada");
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar detalhes da empresa.");
    }
  };

  const toggleStateById = (id, setState) => {
    setState((prev) => {
      if (prev === null || typeof prev !== "object") {
        return prev === id ? null : id;
      } else {
        return { ...prev, [id]: !prev[id] };
      }
    });
  };

  const handleAddUsuario = async (e) => {
    e.preventDefault();
    const formData = {
      nome: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      senha: e.target.password.value,
      tipo_usuario: e.target.tipo_usuario.value,
      fk_empresa_id: id,
    };

    if (formData.tipo_usuario === "cargo") {
      const msg = "Por favor, selecione um cargo.";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      await addUsuario(formData);
      loadUsuarios();
      e.target.reset();
      setError("");
      toast.success(`Usuário ${formData.nome} cadastrado com sucesso!`);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleDeleteUsuario = async (id, nome) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    setDeletingId(id);
    try {
      await deleteUsuario(id);
      await loadUsuarios();
      toast.success(`Usuário ${nome} excluído com sucesso!`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir usuário");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateUsuario = async (e) => {
    e.preventDefault();
    const nome = e.target.nome.value.trim();
    const email = e.target.email.value.trim();
    const tipo_usuario = e.target.tipo_usuario.value;

    if (!nome || !email || !tipo_usuario) {
      setError("Todos os campos são obrigatórios!");
      return;
    }

    try {
      await updateUsuario(editingId, { nome, email, tipo_usuario });
      loadUsuarios();
      setEditingId(null);
      setError("");
      toast.success(`Usuário ${nome} atualizado com sucesso!`);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleVerFuncionario = (id) => {
    navigate(`/agenda/${id}`);
  };

  const handleSearchChangeNome = (e) => {
    const value = e.target.value;
    setSearchParams((prev) => ({ ...prev, nome: value }));
  };

  const handleSearchChangeTipo_Usuario = (e) => {
    const value = e.target.value;
    setSearchParams((prev) => ({
      ...prev,
      tipo_usuario: value === "Todos" ? "" : value,
    }));
  };

  const tipoUsuarioMap = {
    gerente: "Gerente",
    funcionario: "Funcionário",
    secretario: "Secretário",
  };

  return (
    <div className="conteiner_usuario_geral">
      <ToastContainer
        autoClose={1500}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />
      <h1>{empresaNome}</h1>
      <hr />
      <div className="tabela_usuario">
        <table>
          <thead>
            <tr style={{ background: `rgba(177, 209, 196, 0.25)` }}>
              <td colSpan="4" style={{ textAlign: "center" }}>
                <h2>FUNCIONÁRIOS</h2>
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                <div id="botaoBusca_botaoAdd">
                  <div className="">
                    <button
                      id="botao_redondo"
                      className="botao_azul"
                      onClick={toggleShowFilters}
                    >
                      {showFilters ? <SearchOffIcon /> : <SearchIcon />}
                    </button>
                    {showFilters && (
                      <>
                        <input
                          type="text"
                          placeholder="Buscar por nome"
                          value={searchParams.nome}
                          onChange={handleSearchChangeNome}
                        />
                        <select
                          value={searchParams.tipo_usuario || "Todos"}
                          onChange={handleSearchChangeTipo_Usuario}
                        >
                          <option value="Todos">Todos</option>
                          <option value="gerente">Gerente</option>
                          <option value="secretario">Secretário</option>
                          <option value="funcionario">Funcionário</option>
                        </select>
                      </>
                    )}
                  </div>
                  <div className="">
                    {(tipo_usuario === "gerente" ||
                      tipo_usuario === "admin") && (
                        <button
                          id="botao_redondo"
                          className={
                            showAddForm ? "botao-vermelho" : "botao_verde"
                          }
                          type="button"
                          onClick={() => {
                            setShowAddForm((prev) => !prev);
                          }}
                        >
                          {showAddForm ? <CloseIcon /> : <AddIcon />}
                        </button>
                      )}
                    {showAddForm && (
                      <form
                        className="form_usuario"
                        onSubmit={handleAddUsuario}
                        style={{ marginTop: "1rem" }}
                      >
                        <input
                          type="text"
                          name="name"
                          placeholder="Nome"
                          required
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          required
                        />
                        <input
                          type="password"
                          name="password"
                          placeholder="Senha"
                          required
                        />
                        <select name="tipo_usuario" required>
                          <option value="cargo">Cargo</option>
                          <option value="funcionario">Funcionário</option>
                          <option value="secretario">Secretário</option>
                          <option value="gerente">Gerente</option>
                        </select>
                        <button
                          id="botao_redondo"
                          className="botao_verde"
                          type="submit"
                        >
                          <CheckIcon />
                        </button>
                      </form>
                    )}

                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((usuario, index) => (
                <React.Fragment key={usuario.id_usuario}>
                  <tr
                    className="tr-animation"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td>{usuario.nome}</td>
                    <td>
                      {tipoUsuarioMap[usuario.tipo_usuario] ||
                        usuario.tipo_usuario}
                    </td>
                    <td className="botaoNoCanto">
                      {(tipo_usuario === "gerente" ||
                        tipo_usuario === "admin") && (
                          <>
                            <button
                              className="botao-vermelho"
                              onClick={() =>
                                handleDeleteUsuario(
                                  usuario.id_usuario,
                                  usuario.nome
                                )
                              }
                              disabled={deletingId === usuario.id_usuario}
                            >
                              {deletingId === usuario.id_usuario ? (
                                <RotateRightIcon className="loading" />
                              ) : (
                                <DeleteIcon />
                              )}
                            </button>
                            <button
                              className="botao_azul"
                              onClick={() =>
                                toggleStateById(usuario.id_usuario, setEditingId)
                              }
                            >
                              {editingId === usuario.id_usuario ? (
                                <EditOffIcon />
                              ) : (
                                <BorderColorIcon />
                              )}
                            </button>
                          </>
                        )}
                      {(usuario.tipo_usuario === "funcionario" ||
                        usuario.tipo_usuario === "gerente") && (
                          <button
                            className="botao_verde"
                            onClick={() =>
                              handleVerFuncionario(usuario.id_usuario)
                            }
                          >
                            <KeyboardArrowRightIcon />
                          </button>
                        )}
                    </td>
                  </tr>
                  {editingId === usuario.id_usuario && (
                    <tr
                      className="tr-animation"
                      style={{ animationDelay: `${index * 100 + 50}ms` }}
                    >
                      <td colSpan="4">
                        <div className="edit-usuario-form">
                          <h2>Editar Usuário</h2>
                          <form
                            className="form-atualizacao"
                            onSubmit={handleUpdateUsuario}
                          >
                            <label htmlFor="nome">Nome:</label>
                            <input
                              type="text"
                              id="nome"
                              name="nome"
                              defaultValue={usuario.nome}
                              required
                            />
                            <br />
                            <label htmlFor="email">Email:</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              defaultValue={usuario.email}
                              required
                            />
                            <br />
                            <label htmlFor="tipo_usuario">
                              Tipo de Usuário:
                            </label>
                            <select
                              id="tipo_usuario"
                              name="tipo_usuario"
                              defaultValue={usuario.tipo_usuario}
                              required
                            >
                              <option value="funcionario">Funcionário</option>
                              <option value="secretario">Secretário</option>
                              <option value="gerente">Gerente</option>
                            </select>
                            <br />
                            <div className="form-atualizacao_botao">
                              <button className="botao_verde" type="submit">
                                <CheckIcon />
                              </button>
                              <button
                                className="botao-vermelho"
                                type="button"
                                onClick={() => setEditingId(null)}
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
                  Nenhum usuário cadastrado
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
        <span>Página {currentPage}</span>
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

export default Usuario;
