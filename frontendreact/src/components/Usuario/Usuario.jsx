import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchUsuarios,
  addUsuario,
  deleteUsuario,
  updateUsuario,
} from "../../services/usuarioService";
import { fetchEmpresaNome } from "../../services/empresaService";

function Usuario() {
  const { id } = useParams();
  const [usuarios, setUsuarios] = useState([]);
  const [searchParams, setSearchParams] = useState({
    nome: "",
    tipo_usuario: "",
    sortBy: "tipo_usuario, nome",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [empresaNome, setEmpresaNome] = useState("");
  const [error, setError] = useState("");
  const [editingUsuario, setEditingUsuario] = useState(null); // Estado para controlar o usuário sendo editado
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const tipo_usuario = localStorage.getItem("tipo_usuario");
  const [hasMorePages, setHasMorePages] = useState(true);
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
        const usuariosOrdenados = data.sort((a, b) => {
          const ordem = { gerente: 1, funcionario: 2, secretario: 3 };
          return ordem[a.tipo_usuario] - ordem[b.tipo_usuario];
        });
        setUsuarios(usuariosOrdenados);
        setError("");
      } else {
        setUsuarios([]);
        setError("Nenhum usuário cadastrado.");
      }
      setHasMorePages(data.length >= itemsPerPage);
    } catch (error) {
      setHasMorePages(false);
      console.error(error);
      setError("Erro ao carregar usuários.");
    }
  };

  const loadEmpresa = async () => {
    try {
      const nomeEmpresa = await fetchEmpresaNome(id);
      if (nomeEmpresa) {
        setEmpresaNome(nomeEmpresa);
      } else {
        setEmpresaNome("Empresa não encontrada");
      }
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar detalhes da empresa.");
    }
  };

  const handleAddUsuario = async (e) => {
    e.preventDefault();
    const formData = {
        nome: e.target.name.value,
        email: e.target.email.value,
        senha: e.target.password.value,
        tipo_usuario: e.target.tipo_usuario.value,
        fk_empresa_id: id
    };

    try {
      await addUsuario(formData);

      loadUsuarios();
      e.target.reset();
      setError('');
      toast.success("Usuário cadastrado com sucesso!");
    } catch (error) {
      setError(error.message); 
      toast.error(error.message); // Mostra 'Este e-mail já está cadastrado' se for o caso
    }
};


  const handleDeleteUsuario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    setDeletingId(id);
    try {
      await deleteUsuario(id);
      await loadUsuarios();
      toast.success("Usuário excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir usuário");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateUsuario = async (e) => {
    e.preventDefault();
    const nome = e.target.nome.value;
    const email = e.target.email.value;
    const tipo_usuario = e.target.tipo_usuario.value;

    if (!nome || !email || !tipo_usuario) {
      setError("Todos os campos são obrigatórios!");
      return;
    }

    try {
      await updateUsuario(editingUsuario.id_usuario, {
        nome,
        email,
        tipo_usuario,
      });
      loadUsuarios();
      setEditingUsuario(null); // Fechar o formulário de edição após a atualização
    } catch (error) {
      setError("Erro ao atualizar usuário.");
    }
  };

  const handleVerFuncionario = (id) => {
    navigate(`/agenda/${id}`);
  };

  const handleSearchChangeNome = (e) => {
    const value = e.target.value;
    setSearchParams((prevParams) => ({
      ...prevParams,
      nome: value,
    }));
  };

  const handleSearchChangeTipo_Usuario = (e) => {
    const value = e.target.value;
    setSearchParams((prevParams) => ({
      ...prevParams,
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
        autoClose={1200}
        pauseOnHover={false} // Fecha imediatamente ao passar o mouse
        pauseOnFocusLoss={false} // Fecha mesmo quando a janela perde foco
      />
      <h1>{empresaNome}</h1>
      <div className="form_usuario">
        <form onSubmit={(e) => e.preventDefault()}>
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
        </form>
        <hr />
        {(tipo_usuario === "gerente" || tipo_usuario === "admin") && (
          <form onSubmit={handleAddUsuario}>
            <input type="text" name="name" placeholder="Nome" required />
            <input type="text" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Senha" required />
            <select name="tipo_usuario">
              <option value="cargo">Cargo</option>
              <option value="funcionario">Funcionário</option>
              <option value="secretario">Secretário</option>
              <option value="gerente">Gerente</option>
            </select>
            <button 
              className="botao_verde"
              type="submit"
            >
              Adicionar Funcionário
            </button>
          </form>
        )}
      </div>
      <div className="tabela_usuario">
        <table>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <React.Fragment key={usuario.id_usuario}>
                  <tr>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>
                      {tipoUsuarioMap[usuario.tipo_usuario] ||
                        usuario.tipo_usuario}
                    </td>
                    <td>
                      {(tipo_usuario === "gerente" ||
                        tipo_usuario === "admin") && (
                        <button
                          className="botao-vermelho"
                          onClick={() =>
                            handleDeleteUsuario(usuario.id_usuario)
                          }
                          disabled={deletingId === usuario.id_usuario}
                        >
                          {deletingId === usuario.id_usuario
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      )}
                      {(tipo_usuario === "gerente" ||
                        tipo_usuario === "admin") && (
                        <button 
                          className="botao_verde"
                          onClick={() => setEditingUsuario(usuario)}
                        >
                          Atualizar
                        </button>
                      )}
                      {(usuario.tipo_usuario === "funcionario" ||
                        usuario.tipo_usuario === "gerente") && (
                        <button
                          className="botao_verde"
                          onClick={() =>
                            handleVerFuncionario(usuario.id_usuario)
                          }
                        >
                          Ver Agenda
                        </button>
                      )}
                    </td>
                  </tr>
                  {editingUsuario &&
                    editingUsuario.id_usuario === usuario.id_usuario && (
                      <tr className="editando_usuario">
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
                                defaultValue={editingUsuario.nome}
                                required
                              />
                              <br />
                              <label htmlFor="email">Email:</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                defaultValue={editingUsuario.email}
                                required
                              />
                              <br />
                              <label htmlFor="tipo_usuario">
                                Tipo de Usuário:
                              </label>
                              <select
                                id="tipo_usuario"
                                name="tipo_usuario"
                                defaultValue={editingUsuario.tipo_usuario}
                                required
                              >
                                <option value="funcionario">Funcionário</option>
                                <option value="secretario">Secretário</option>
                                <option value="gerente">Gerente</option>
                              </select>
                              <br />
                              <div className="form-atualizacao_botao">
                                <button 
                                  className="botao_verde"
                                  type="submit"
                                >
                                  Salvar
                                </button>
                                <button
                                  type="button"
                                  className="botao-vermelho"
                                  onClick={() => setEditingUsuario(null)}
                                >
                                  Cancelar
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
        <div className="vai_volta">
          <button
            className="botao_verde"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <button 
            className="botao_verde"
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={!hasMorePages}
          > 
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

export default Usuario;
