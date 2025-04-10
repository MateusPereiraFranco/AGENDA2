import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAgendamentos,
  addAgendamento,
  deleteAgendamento,
  updateAgendamento,
} from "../../services/agendaService";
import { fetchUsuarioNome } from "../../services/usuarioService";

function Agenda() {
  const { id } = useParams();
  const navigate = useNavigate();

  const tipo_usuario = localStorage.getItem("tipo_usuario");
  const id_usuario = localStorage.getItem("id_usuario");

  const [agendamentos, setAgendamentos] = useState([]);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [error, setError] = useState("");
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    sortBy: "data",
    order: "ASC",
    dataInicio: new Date().toISOString().split("T")[0], // <-- data de hoje em formato yyyy-mm-dd
    dataFim: ""
  });
  

  useEffect(() => {
    loadAgendamentos();
    loadUsuarioName();
  }, [currentPage]);

  const loadAgendamentos = async () => {
    if (searchParams.dataInicio && searchParams.dataFim &&
      new Date(searchParams.dataFim) < new Date(searchParams.dataInicio)) {
      toast.error("A data final não pode ser anterior à data inicial");
      return;
    }

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
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error(error.message || "Erro ao carregar agendamentos");
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
    loadAgendamentos();
  };

  const limparFiltros = () => {
    setSearchParams({
      sortBy: "data",
      order: "ASC",
      dataInicio: "",
      dataFim: ""
    });
    setCurrentPage(1);
    loadAgendamentos();
  };

  const handleAddAgendamento = async (e) => {
    e.preventDefault();
    const data = e.target.data.value;

    const fk_usuario_id = tipo_usuario === "funcionario" ? id_usuario : id;

    try {
      await addAgendamento({ data, fk_usuario_id });
      toast.success("Agendamento adicionado com sucesso!");
      loadAgendamentos();
      e.target.reset();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar agendamento");
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
    const fk_usuario_id = editingAgendamento.fk_usuario_id;

    if (!data) {
      toast.error("O campo de data é obrigatório!");
      return;
    }

    try {
      await updateAgendamento(editingAgendamento.id_agenda, { data, fk_usuario_id });
      toast.success("Agendamento atualizado!");
      loadAgendamentos();
      setEditingAgendamento(null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar agendamento");
    }
  };

  const handleVerAgenda = (id) => {
    navigate(`/horario/${id}`);
  };

  const getDataClassName = (dataString) => {
    // Converte a string "DD/MM/AAAA" para objeto Date
    const [dia, mes, ano] = dataString.split('/');
    const data = new Date(ano, mes - 1, dia); // mês é 0-based no JS
    
    // Data atual (sem horas/minutos/segundos)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Comparação correta
    if (data.getTime() === hoje.getTime()) return "data-hoje";
    if (data < hoje) return "data-passado";
    return "data-futuro";
  };


  return (
    <div className="agenda_conteiner_geral">
      <ToastContainer autoClose={1500} pauseOnHover={false} pauseOnFocusLoss={false} />
      <h1>{usuarioNome}</h1>
      <hr />
      <h2>Agenda</h2>
      <div className="form_agenda">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="date"
            placeholder="Data inicial"
            value={searchParams.dataInicio}
            onChange={(e) =>
              setSearchParams({ ...searchParams, dataInicio: e.target.value })
            }
          />
          <input
            type="date"
            placeholder="Data final"
            value={searchParams.dataFim}
            onChange={(e) =>
              setSearchParams({ ...searchParams, dataFim: e.target.value })
            }
          />
          <button type="button" onClick={handleSearch}>
            Buscar
          </button>
          <button type="button" onClick={limparFiltros}>
            Limpar
          </button>
        </form>
        <hr />
        <form onSubmit={handleAddAgendamento}>
          <input type="date" name="data" placeholder="Data" required />
          <button type="submit">Adicionar Agendamento</button>
        </form>
      </div>
      <div className="tabela_agenda">
        <table>
          <tbody>
            {agendamentos.length > 0 ? (
              agendamentos.map((agendamento) => (
                <React.Fragment key={agendamento.id_agenda}>
                  <tr>
                    <td className={getDataClassName(agendamento.data)}>
                      {agendamento.data}
                    </td>
                    <td>
                      <button
                        className="botao-vermelho"
                        onClick={() => handleDeleteEmpresa(agendamento.id_agenda)}
                        disabled={deletingId === agendamento.id_agenda}
                      >
                        {deletingId === agendamento.id_agenda
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                      {(tipo_usuario === "gerente" || tipo_usuario === "admin") && (
                        <button onClick={() => setEditingAgendamento(agendamento)}>
                          Atualizar
                        </button>
                      )}
                      <button onClick={() => handleVerAgenda(agendamento.id_agenda)}>
                        Ver Agenda
                      </button>
                    </td>
                  </tr>
                  {editingAgendamento &&
                    editingAgendamento.id_agenda === agendamento.id_agenda && (
                      <tr className="editando_agendamento">
                        <td colSpan="2">
                          <form
                            className="form-atualizacao"
                            onSubmit={handleUpdateAgendamento}
                          >
                            <label htmlFor="data">Nova Data:</label>
                            <input
                              type="date"
                              name="data"
                              defaultValue={editingAgendamento.data}
                              required
                            />
                            <button type="submit">Salvar</button>
                            <button
                              type="button"
                              className="botao-vermelho"
                              onClick={() => setEditingAgendamento(null)}
                            >
                              Cancelar
                            </button>
                          </form>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: "center" }}>
                  Nenhum agendamento cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="vai_volta">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <button onClick={() => setCurrentPage(currentPage + 1)}>Próxima</button>
      </div>
    </div>
  );
}

export default Agenda;
