import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchHorarios,
  addHorario,
  deleteHorario,
  updateHorario,
} from "../../services/horarioService";
import { fetchUsuarioNome } from "../../services/usuarioService";

//icons
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditOffIcon from "@mui/icons-material/EditOff";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  fetchAgendamentoData,
  fetchAgendamentosFkUsuarioId,
} from "../../services/agendaService";
import { useAuth } from "../../context/AuthContext";

function Horario() {
  const { user } = useAuth();
  const { id_usuario } = user || {};
  const { id } = useParams();

  const [horarios, setHorarios] = useState([]);
  const [searchParams, setSearchParams] = useState({ sortBy: "horario" });
  const [currentPage, setCurrentPage] = useState(1);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [nomeUsuarioLogado, setNomeUsuarioLogado] = useState("");
  const [dataAgenda, setDataAgenda] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [contato, setContato] = useState("");
  const [detalhesVisiveis, setDetalhesVisiveis] = useState({});
  const itemsPerPage = 10;
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [valor, setValor] = useState("");
  const [valorUpdate, setValorUpdate] = useState("");
  const editInputRef = useRef(null);

  const toggleShowFilters = () => {
    setShowFilters((prev) => !prev);
  };
  const toggleShowAddForm = () => {
    setShowAddForm((prev) => !prev);
  };

  useEffect(() => {
    loadHorarios();
    loadUsuarioNameLogado();
    getFkUsuarioIdAgendaECarregaNome();
    getDataAgenda();
  }, [currentPage, searchParams]);

  useEffect(() => {
    if (editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editingId]);

  const handleValorChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    let formatted = (Number(raw) / 100).toFixed(2).replace(".", ",");
    setValor("R$ " + formatted);
  };

  const handleValorUpdateChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    let formatted = (Number(raw) / 100).toFixed(2).replace(".", ",");
    setValorUpdate("R$ " + formatted);
  };

  // Função genérica para toggles
  const toggleStateById = (id, setState) => {
    setState((prev) => {
      if (prev === null || typeof prev !== "object") {
        return prev === id ? null : id;
      } else {
        return { ...prev, [id]: !prev[id] };
      }
    });
  };

  const toggleDetalhes = (id) => toggleStateById(id, setDetalhesVisiveis);

  const handleContatoChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    let formattedInput = "";

    if (input.length > 0) {
      formattedInput = `(${input.substring(0, 2)}`;
    }
    if (input.length > 2) {
      formattedInput += `) ${input.substring(2, 7)}`;
    }
    if (input.length > 7) {
      formattedInput += `-${input.substring(7, 11)}`;
    }
    setContato(formattedInput);
  };

  const loadHorarios = async () => {
    try {
      const params = { ...searchParams };
      if (params.nome === "") {
        delete params.nome;
      }
      params.page = currentPage;

      const data = await fetchHorarios(id, params);
      setHorarios(data || []);
      setHasMorePages(data.length >= itemsPerPage);
    } catch (error) {
      setHasMorePages(false);
      console.error(error);
    }
  };

  const getDataAgenda = async () => {
    try {
      const data = await fetchAgendamentoData(id);
      setDataAgenda(data.data || "Data não encontrada");
    } catch (error) {
      console.error("Erro ao buscar data da agenda:", error);
    }
  };

  const getFkUsuarioIdAgendaECarregaNome = async () => {
    try {
      const fk_usuario_id_agenda = await fetchAgendamentosFkUsuarioId(id);
      const idUsuario = fk_usuario_id_agenda.fk_usuario_id;

      if (!idUsuario) {
        console.error("ID do usuário da agenda não encontrado");
        return;
      }

      const nomeUsuario = await fetchUsuarioNome(idUsuario);
      setUsuarioNome(nomeUsuario || "Usuário não encontrado");
    } catch (error) {
      console.error("Erro ao buscar ID do usuário da agenda ou nome:", error);
      setError("Erro ao carregar detalhes do usuário.");
    }
  };

  const loadUsuarioNameLogado = async () => {
    try {
      const nomeUsuario = await fetchUsuarioNome(id_usuario);
      setNomeUsuarioLogado(nomeUsuario || "Usuário não encontrado");
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar detalhes do usuário.");
    }
  };

  const formatarHorarioSemSegundos = (horarioCompleto) => {
    if (!horarioCompleto) return "";
    const partes = horarioCompleto.split(":");
    return `${partes[0]}:${partes[1]}`;
  };

  const handleAddHorario = async (e) => {
    e.preventDefault();
    const horario = {
      horario: e.target.horario.value,
      nome: e.target.nome.value,
      contato: contato,
      observacoes: e.target.observacoes.value,
      agendadoPor: `${nomeUsuarioLogado}`,
      valor_servico: parseFloat(
        e.target.valor_servico.value.replace("R$", "").replace(",", ".")
      ),
      fk_agenda_id: id,
    };
    try {
      await addHorario({ horario }, id_usuario);
      loadHorarios();
      e.target.reset();
      setContato("");
      setValor("");
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleDeleteHorario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir o horário?")) return;
    setDeletingId(id);
    try {
      await deleteHorario(id);
      loadHorarios();
      toast.success("Horário excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir horário");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateHorario = async (e) => {
    e.preventDefault();
    const nome = e.target.nome.value.trim();
    const valor = parseFloat(
      e.target.valor.value.replace("R$", "").replace(",", ".")
    );

    if (!nome || !valor) {
      setError("Todos os campos são obrigatórios!");
      return;
    }

    try {
      await updateHorario(editingId, { nome, valor });
      loadHorarios();
      setEditingId(null);
      setError("");
      toast.success(`Horário atualizado com sucesso!`);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="horarios_container_geral">
      <ToastContainer
        autoClose={1500}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />
      <h1>{usuarioNome}</h1>
      <hr />
      <div className="tabela">
        <table>
          <thead>
            <tr style={{ background: `rgba(177, 209, 196, 0.25)` }}>
              <td colSpan="4">
                <h2>{dataAgenda}</h2>
              </td>
            </tr>
            <tr>
              <td colSpan="4">
                <div id="botaoBusca_botaoAdd">
                  <button
                    id="botao_redondo"
                    className="botao_azul"
                    onClick={toggleShowFilters}
                  >{showFilters ? <SearchOffIcon /> : <SearchIcon />}</button>
                  <button
                    id="botao_redondo"
                    className={
                      showAddForm ? "botao-vermelho" : "botao_verde"
                    }
                    type="button"
                    onClick={
                      toggleShowAddForm
                    }
                  >{showAddForm ? <CloseIcon /> : <AddIcon />}</button>
                  {showAddForm && (
                    <div className="form_horario">
                      <form className="add_horario" onSubmit={handleAddHorario}>
                        <div>
                          <input type="time" name="horario" placeholder="Horário" required />
                          <input type="text" name="nome" placeholder="Nome" required />
                          <input
                            type="text"
                            name="contato"
                            placeholder="Contato (Opcional)"
                            value={contato}
                            onChange={handleContatoChange}
                            maxLength={15}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            id="valor_servico"
                            name="valor_servico"
                            placeholder="R$ 0,00"
                            value={valor}
                            onChange={handleValorChange}
                            required
                          />
                          <input
                            type="text"
                            name="observacoes"
                            placeholder="Observação (Opcional)"
                          />
                          <button className="botao_verde" type="submit">
                            Adicionar Horário
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <th>Horário</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {horarios.length > 0 ? (
              horarios.map((horario, index) => (
                <React.Fragment key={horario.id_horario}>
                  <tr
                    className="tr-animation"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td>{formatarHorarioSemSegundos(horario.horario)}</td>
                    <td>{horario.nome}</td>
                    <td>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(horario.valor_servico)}
                    </td>
                    <td className="botaoNoCanto">
                      <button
                        className="botao-vermelho"
                        onClick={() => handleDeleteHorario(horario.id_horario)}
                        disabled={deletingId === horario.id_horario}
                      >
                        {deletingId === horario.id_horario ? (
                          <RotateRightIcon className="loading" />
                        ) : (
                          <DeleteIcon />
                        )}
                      </button>
                      <button
                        className="botao_azul"
                        onClick={() =>
                          toggleStateById(horario.id_horario, setEditingId)
                        }
                      >
                        {editingId === horario.id_horario ? (
                          <EditOffIcon />
                        ) : (
                          <BorderColorIcon />
                        )}
                      </button>
                      <button
                        className="botao_azul"
                        onClick={() => toggleDetalhes(horario.id_horario)}
                      >
                        {detalhesVisiveis[horario.id_horario] ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </button>
                    </td>
                  </tr>

                  {detalhesVisiveis[horario.id_horario] && (
                    <tr
                      className="tr-animation"
                      style={{ animationDelay: `${index * 100 + 50}ms` }}
                    >
                      <td colSpan="4">
                        <div className="info_horario">
                          <p>
                            <strong>Contato:</strong> {horario.contato}
                          </p>
                          <p>
                            <strong>Obs:</strong> {horario.observacoes}
                          </p>
                          <p>
                            <strong>Agendado Por:</strong> {horario.agendadopor}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {editingId === horario.id_horario && (
                    <tr
                      className="tr-animation"
                      style={{ animationDelay: `${index * 100 + 50}ms` }}
                    >
                      <td colSpan="4">
                        <div className="edit-usuario-form">
                          <div className="edit-usuario-form">
                            <h2>Editar horário</h2>
                            <form
                              className="form-atualizacao"
                              onSubmit={handleUpdateHorario}
                            >
                              <label htmlFor="nome">Nome:</label>
                              <input
                                type="text"
                                id="nome"
                                name="nome"
                                defaultValue={horario.nome}
                                required
                              />
                              <br />
                              <label htmlFor="valor">Valor:</label>
                              <input
                                type="text"
                                id="valor"
                                name="valor"
                                placeholder="R$ 0,00"
                                value={valorUpdate}
                                onChange={handleValorUpdateChange}
                                required
                                ref={editInputRef}
                              />
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
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Nenhum horário cadastrado
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

export default Horario;
