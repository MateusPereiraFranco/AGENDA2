import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAgendamentos,
  addAgendamento,
  deleteAgendamento,
  updateAgendamento,
} from "../../services/agendaService";
import { fetchUsuarioNome } from "../../services/usuarioService";

//icons
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import EditOffIcon from "@mui/icons-material/EditOff";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext";

function Agenda() {
  const { id } = useParams();
  const { user } = useAuth();
  const { tipo_usuario } = user || {};

  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState([]);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [error, setError] = useState("");
  const [editingAgendamentoId, setEditingAgendamentoId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const toggleStateById = (id, setState) => {
    setState((prev) => {
      if (prev === null || typeof prev !== "object") {
        return prev === id ? null : id;
      } else {
        return { ...prev, [id]: !prev[id] };
      }
    });
  };

  const getDataHoje = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  };

  const [searchParams, setSearchParams] = useState({
    sortBy: "data",
    order: "ASC",
    dataInicio: getDataHoje().toISOString().split("T")[0],
    dataFim: "",
  });

  useEffect(() => {
    loadAgendamentos();
    loadUsuarioName();
  }, [currentPage]);

  const loadAgendamentos = async () => {
    if (
      searchParams.dataInicio &&
      searchParams.dataFim &&
      new Date(searchParams.dataFim) < new Date(searchParams.dataInicio)
    ) {
      toast.error("A data final não pode ser anterior à data inicial");
      return;
    }

    setLoading(true);

    try {
      const params = {
        page: currentPage,
        sortBy: searchParams.sortBy,
        order: searchParams.order,
        ...(searchParams.dataInicio && { dataInicio: searchParams.dataInicio }),
        ...(searchParams.dataFim && { dataFim: searchParams.dataFim }),
      };

      const data = await fetchAgendamentos(id, params);
      setAgendamentos(data || []);
      setHasMorePages(data.length >= itemsPerPage);
    } catch (error) {
      setHasMorePages(false);
      console.error("Erro ao carregar agendamentos:", error);
      toast.error(error.message || "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarioName = async () => {
    try {
      const nomeUsuario = await fetchUsuarioNome(id);
      setUsuarioNome(nomeUsuario || "Usuário não encontrado");
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar detalhes do usuário.");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setHasMorePages(true);
    loadAgendamentos();
  };

  const limparFiltros = () => {
    setSearchParams({
      sortBy: "data",
      order: "ASC",
      dataInicio: "",
      dataFim: "",
    });
    setCurrentPage(1);
    setHasMorePages(true);
    loadAgendamentos();
  };

  const handleAddAgendamento = async (e) => {
    e.preventDefault();
    const data = e.target.data.value;

    try {
      await addAgendamento({ data }, id);
      toast.success("Agendamento adicionado com sucesso!");
      loadAgendamentos();
      e.target.reset();
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleDeleteEmpresa = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta agenda?")) return;

    setDeletingId(id);
    try {
      await deleteAgendamento(id);
      await loadAgendamentos();
      toast.success("Agenda excluída");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir agenda");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateAgendamento = async (e) => {
    e.preventDefault();
    const data = e.target.data.value;

    if (!data) {
      toast.error("O campo de data é obrigatório!");
      return;
    }

    try {
      await updateAgendamento(editingAgendamentoId, {
        data,
      });
      toast.success("Agendamento atualizado!");
      loadAgendamentos();
      setEditingAgendamentoId(null);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleVerAgenda = (id) => {
    navigate(`/horario/${id}`);
  };

  const getDataClassName = (dataString) => {
    const [dia, mes, ano] = dataString.split("/");
    const data = new Date(ano, mes - 1, dia);
    const hoje = getDataHoje();

    if (data.getTime() === hoje.getTime()) return "data-hoje";
    if (data < hoje) return "data-passado";
    return "data-futuro";
  };

  return (
    <div className="agenda_conteiner_geral">
      <ToastContainer
        autoClose={1500}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />
      <h1>{usuarioNome}</h1>
      <hr />
      <div className="form_agenda">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="date"
            value={searchParams.dataInicio}
            onChange={(e) =>
              setSearchParams({ ...searchParams, dataInicio: e.target.value })
            }
          />
          <input
            type="date"
            value={searchParams.dataFim}
            onChange={(e) =>
              setSearchParams({ ...searchParams, dataFim: e.target.value })
            }
          />
          <button className="botao_verde" type="button" onClick={handleSearch}>
            Buscar
          </button>
          <button className="botao_verde" type="button" onClick={limparFiltros}>
            Limpar
          </button>
        </form>
        <hr />
        <form onSubmit={handleAddAgendamento}>
          <input type="date" name="data" required />
          <button className="botao_verde" type="submit">
            Adicionar Agendamento
          </button>
        </form>
      </div>

      <div className="tabela_agenda">
        <table>
          <thead>
            <tr style={{ background: `rgba(177, 209, 196, 0.25)` }}>
              <td colSpan="4">
                <h2>AGENDA</h2>
              </td>
            </tr>
            <tr>
              <td>Data</td>
              <td>Agendados</td>
              <td>Valor</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  Carregando...
                </td>
              </tr>
            ) : agendamentos.length > 0 ? (
              agendamentos.map((agendamento, index) => (
                <React.Fragment key={agendamento.id_agenda}>
                  <tr
                    className="tr-animation"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td className={getDataClassName(agendamento.data)}>
                      {agendamento.data}
                    </td>
                    <td>{agendamento.total_horarios}</td>
                    <td>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(agendamento.total_valores)}
                    </td>
                    <td className="botaoNoCanto">
                      <button
                        className="botao-vermelho"
                        onClick={() =>
                          handleDeleteEmpresa(agendamento.id_agenda)
                        }
                        disabled={deletingId === agendamento.id_agenda}
                      >
                        {deletingId === agendamento.id_agenda ? (
                          <RotateRightIcon className="loading" />
                        ) : (
                          <DeleteIcon />
                        )}
                      </button>
                      {(tipo_usuario === "gerente" ||
                        tipo_usuario === "admin") && (
                          <button
                            className="botao_azul"
                            onClick={() =>
                              toggleStateById(
                                agendamento.id_agenda,
                                setEditingAgendamentoId
                              )
                            }
                          >
                            {editingAgendamentoId === agendamento.id_agenda ? (
                              <EditOffIcon />
                            ) : (
                              <BorderColorIcon />
                            )}
                          </button>
                        )}
                      <button
                        className="botao_verde"
                        onClick={() => handleVerAgenda(agendamento.id_agenda)}
                      >
                        <KeyboardArrowRightIcon />
                      </button>
                    </td>
                  </tr>

                  {editingAgendamentoId === agendamento.id_agenda && (
                    <tr
                      className="tr-animation"
                      style={{ animationDelay: `${index * 100 + 50}ms` }}
                    >
                      <td colSpan="4">
                        <form
                          className="form-atualizacao"
                          onSubmit={handleUpdateAgendamento}
                        >
                          <label htmlFor="data">Nova Data:</label>
                          <input
                            type="date"
                            name="data"
                            defaultValue={agendamento.data}
                            required
                          />
                          <br />
                          <div className="form-atualizacao_botao">
                            <button className="botao_verde" type="submit">
                              <CheckIcon />
                            </button>
                            <button
                              type="button"
                              className="botao-vermelho"
                              onClick={() => setEditingAgendamentoId(null)}
                            >
                              <CloseIcon />
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Nenhum agendamento cadastrado
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

export default Agenda;
