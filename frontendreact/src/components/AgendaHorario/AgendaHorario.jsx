import React, { useState, useEffect, useRef } from "react";
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
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import EditOffIcon from "@mui/icons-material/EditOff";
import DeleteIcon from "@mui/icons-material/Delete";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { useAuth } from "../../context/AuthContext";
import {
  addHorario,
  deleteHorario,
  fetchHorarios,
  updateHorario,
} from "../../services/horarioService";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function AgendaHorario() {
  const { id } = useParams();
  const { user } = useAuth();
  const { tipo_usuario } = user || {};

  const navigate = useNavigate();

  // agendamento
  const [agendamentos, setAgendamentos] = useState([]);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [error, setError] = useState("");
  const [editingAgendamentoId, setEditingAgendamentoId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  //  horario
  const [horarios, setHorarios] = useState([]);
  const [contato, setContato] = useState("");
  const [valor, setValor] = useState("");
  const [editingHorarioId, setEditingHorarioId] = useState(null);
  const [valorUpdate, setValorUpdate] = useState("");
  const [deletingHorarioId, setDeletingHorarioId] = useState(null);
  const [detalhesVisiveis, setDetalhesVisiveis] = useState({});
  const [horarioFiltro, setHorarioFiltro] = useState("todos");
  const itemsPerPage = 50;
  const [searchParams, setSearchParams] = useState({ sortBy: "horario" });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);

  const editInputRef = useRef(null);

  const handleValorUpdateChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    let formatted = (Number(raw) / 100).toFixed(2).replace(".", ",");
    setValorUpdate("R$ " + formatted);
  };

  const toggleDetalhes = (id) => toggleStateByHoarioId(id, setDetalhesVisiveis);

  const toggleStateByHoarioId = (id, setState) => {
    setState((prev) => {
      if (prev === null || typeof prev !== "object") {
        return prev === id ? null : id;
      } else {
        return { ...prev, [id]: !prev[id] };
      }
    });
  };


  const loadAgendamentos = async () => {
    setLoading(true);
    try {
      const params = {
        dataInicio: selectedDate.toISOString().split("T")[0],
        dataFim: selectedDate.toISOString().split("T")[0],
        sortBy: "data",
        order: "ASC",
      };
      const data = await fetchAgendamentos(id, params);
      setAgendamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error(error.message || "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const loadHorarios = async () => {
    try {
      const params = { ...searchParams, page: currentPage };
      let data;
      if (agendamentos.length !== 0) {
        data = await fetchHorarios(agendamentos[0].id_agenda, params);
      }
      setHorarios(data || []);
      setHasMorePages((data || []).length >= itemsPerPage);
    } catch (error) {
      setHasMorePages(false);
      console.error(error);
    }
  };

  const filtrarHorarios = () => {
    if (!horarios) return [];

    return horarios.filter((item) => {
      const [horaStr] = item.horario.split(":");
      const hora = parseInt(horaStr, 10);

      if (horarioFiltro === "manha") return hora < 12;
      if (horarioFiltro === "tarde") return hora >= 12;

      return true; // "todos"
    });
  };

  const handleAddHorario = async (e) => {
    e.preventDefault();

    let agendaId;

    if (!agendamentos || agendamentos.length === 0) {
      try {
        const newAgendamento = await addAgendamento(
          { data: selectedDate.toISOString().split("T")[0] },
          id
        );
        toast.success("Agendamento adicionado com sucesso!");

        // Atualiza a agenda local
        await loadAgendamentos();
        console.log(
          "Novo agendamento adicionado:",
          newAgendamento.data.id_agenda
        );
        agendaId = newAgendamento.data.id_agenda; // <- Pegue o ID retornado aqui
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
        return; // interrompe o fluxo
      }
    } else {
      console.log("Agendamentos existentes:", agendamentos);
      agendaId = agendamentos[0].id_agenda;
    }

    const horario = {
      horario: e.target.horario.value,
      nome: e.target.nome.value,
      contato: contato,
      observacoes: e.target.observacoes.value,
      agendadoPor: `${usuarioNome}`,
      valor_servico: parseFloat(
        e.target.valor_servico.value.replace("R$", "").replace(",", ".")
      ),
      fk_agenda_id: agendaId, // Usa o ID certo
    };

    try {
      await addHorario({ horario }, id);
      await loadHorarios();
      await loadAgendamentos();
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
    setDeletingHorarioId(id);
    try {
      await deleteHorario(id);
      loadHorarios();
      toast.success("Horário excluído");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir horário");
    } finally {
      setDeletingHorarioId(null);
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
      await updateHorario(editingHorarioId, { nome, valor });
      loadHorarios();
      setEditingHorarioId(null);
      setError("");
      toast.success(`Horário atualizado com sucesso!`);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const formatarHorarioSemSegundos = (horarioCompleto) => {
    if (!horarioCompleto) return "";
    const partes = horarioCompleto.split(":");
    return `${partes[0]}:${partes[1]}`;
  };

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

  const handleValorChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    let formatted = (Number(raw) / 100).toFixed(2).replace(".", ",");
    setValor("R$ " + formatted);
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

  useEffect(() => {
    loadUsuarioName();
  }, []);

  useEffect(() => {
    loadAgendamentos();
  }, [selectedDate]);

  useEffect(() => {
    if (agendamentos.length > 0) {
      loadHorarios(agendamentos[0].id_agenda);
    } else {
      setHorarios([]);
    }
  }, [agendamentos, currentPage, searchParams]);

  const toggleShowAddForm = () => {
    setShowAddForm((prev) => !prev);
  };

  const toggleStateById = (id, setState) => {
    setState((prev) => (prev === id ? null : id));
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

  const handleDeleteAgenda = async (id_agenda) => {
    if (!window.confirm("Tem certeza que deseja excluir esta agenda?")) return;

    setDeletingId(id_agenda);
    try {
      await deleteAgendamento(id_agenda);
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
      await updateAgendamento(editingAgendamentoId, { data });
      toast.success("Agendamento atualizado!");
      loadAgendamentos();
      setEditingAgendamentoId(null);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleVerAgenda = (id_agenda) => {
    navigate(`/horario/${id_agenda}`);
  };

  // Helper: gerar os dias da semana baseados na data atual
  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Começa na segunda

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(selectedDate);
    prevWeek.setDate(selectedDate.getDate() - 7);
    setSelectedDate(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(selectedDate.getDate() + 7);
    setSelectedDate(nextWeek);
  };

  const weekDays = getWeekDays(selectedDate);

  return (
    <div className="agenda_conteiner_geral">
      <ToastContainer
        autoClose={1500}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />
      <h1>{usuarioNome}</h1>

      <div className="semana-slider">
        <button onClick={handlePrevWeek}>
          <ArrowBackIosIcon />
        </button>
        {weekDays.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={
              day.toDateString() === selectedDate.toDateString()
                ? "slideDataSelected"
                : "slideData"
            }
          >
            <div>
              {day.toLocaleDateString("pt-BR", {
                weekday: "short",
              })}
            </div>
            <div>
              {day.toLocaleDateString("pt-BR", {
                day: "2-digit",
              })}
            </div>
          </button>
        ))}
        <button onClick={handleNextWeek}>
          <ArrowForwardIosIcon />
        </button>
        {/*        <button onClick={() => setShowFullCalendar((prev) => !prev)}>
          <CalendarMonthIcon />
          </button> 
          */}
      </div>

      {showFullCalendar && (
        <div style={{ marginBottom: "1rem" }}>
          <Calendar
            onChange={(date) => {
              setSelectedDate(date);
              setShowFullCalendar(false);
            }}
            value={selectedDate}
            locale="pt-BR"
          />
        </div>
      )}

      <div className="tabela_agenda">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Agendados</th>
              <th>Valor</th>
              <th></th>
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
              agendamentos.map((agendamento) => (
                <React.Fragment key={agendamento.id_agenda}>
                  <tr>
                    <td>{agendamento.data}</td>
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
                          handleDeleteAgenda(agendamento.id_agenda)
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
                    </td>
                  </tr>

                  {editingAgendamentoId === agendamento.id_agenda && (
                    <tr>
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
                            ref={editInputRef}
                          />
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
      <hr style={{ margin: "2rem 0" }} />
      <div style={{ marginTop: "1rem" }}>
        <button
          id="botao_redondo"
          className={showAddForm ? "botao-vermelho" : "botao_verde"}
          onClick={toggleShowAddForm}
        >
          {showAddForm ? <CloseIcon /> : <AddIcon />}
        </button>
        {showAddForm && (
          <div className="form_horario">
            <form onSubmit={handleAddHorario}>
              <input
                type="time"
                name="horario"
                placeholder="Horário"
                required
              />
              <input
                type="text"
                id="valor_servico"
                name="valor_servico"
                placeholder="R$ 0,00"
                value={valor}
                onChange={handleValorChange}
                required
              />
              <input type="text" name="nome" placeholder="Nome" required />
              <input
                type="text"
                name="contato"
                placeholder="Contato (Opcional)"
                value={contato}
                onChange={handleContatoChange}
                maxLength={15}
              />
              <input
                type="text"
                name="observacoes"
                placeholder="Observação (Opcional)"
              />
              <button id="botao_redondo" className="botao_verde" type="submit">
                <CheckIcon />
              </button>
            </form>
          </div>
        )}
      </div>
      {/* Renderiza a tabela de horários apenas se houver agendamentos */}
      <div>
        <div className="filtro_horarios">
          <label>Filtrar Horários: </label>
          <select
            value={horarioFiltro}
            onChange={(e) => setHorarioFiltro(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
          </select>
        </div>
        <div className="tabela_horarios">
          <table>
            <thead>
              <tr>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {horarios.length > 0 ? (
                filtrarHorarios().map((horario, index) => (
                  <>
                    <tr key={horario.id_horario}>
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
                          onClick={() =>
                            handleDeleteHorario(horario.id_horario)
                          }
                          disabled={deletingHorarioId === horario.id_horario}
                        >
                          {deletingHorarioId === horario.id_horario ? (
                            <RotateRightIcon className="loading" />
                          ) : (
                            <DeleteIcon />
                          )}
                        </button>
                        <button
                          className="botao_azul"
                          onClick={() =>
                            toggleStateById(
                              horario.id_horario,
                              setEditingHorarioId
                            )
                          }
                        >
                          {editingHorarioId === horario.id_horario ? (
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
                              <strong>Agendado Por:</strong>{" "}
                              {horario.agendadopor}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {editingHorarioId === horario.id_horario && (
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
                                    onClick={() => setEditingHorarioId(null)}
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
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    Nenhum horário encontrado
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
      </div>
    </div>
  );
}

export default AgendaHorario;
