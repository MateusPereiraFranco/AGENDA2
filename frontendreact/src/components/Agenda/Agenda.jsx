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

function Agenda() {
  const { id } = useParams();
  const [agendamentos, setAgendamentos] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAgendamento, setEditingAgendamento] = useState(null); // Estado para controle de edição
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const tipo_usuario = localStorage.getItem("tipo_usuario");
  const id_usuario = localStorage.getItem("id_usuario");

  useEffect(() => {
    loadAgendamentos();
  }, [currentPage, searchParams]);

  const loadAgendamentos = async () => {
    try {
      const params = {
        page: currentPage,
        ...(searchParams.data && { data: searchParams.data }),
      };

      const data = await fetchAgendamentos(id, params);
      setAgendamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      alert(error.message || "Erro ao carregar agendamentos");
    }
  };

  const handleAddAgendamento = async (e) => {
    e.preventDefault();
    const data = e.target.data.value;

    const fk_usuario_id = tipo_usuario === "funcionario" ? id_usuario : id;

    try {
      await addAgendamento({ data, fk_usuario_id });
      loadAgendamentos();
      e.target.reset(); // Limpa o formulário após adicionar
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar agendamento");
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
    const fk_usuario_id = editingAgendamento.fk_usuario_id

    if (!data) {
      alert("O campo é obrigatório!");
      return;
    }

    try {
      await updateAgendamento(editingAgendamento.id_agenda, { data, fk_usuario_id});
      loadAgendamentos();
      setEditingAgendamento(null); // Fecha o formulário de edição
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar agendamento");
    }
  };

  const handleVerAgenda = (id) => {
    navigate(`/horario/${id}`);
  };

  return (
    <div className="agenda_conteiner_geral">
      <ToastContainer
        autoClose={1500}
        pauseOnHover={false} // Fecha imediatamente ao passar o mouse
        pauseOnFocusLoss={false} // Fecha mesmo quando a janela perde foco
      />
      <h1>Agendamentos</h1>
      <div className="form_agenda">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="date"
            placeholder="Buscar por data"
            onChange={(e) => setSearchParams({ data: e.target.value })}
          />
          <button type="submit">Buscar</button>
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
                    <td>{agendamento.data}</td>
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
                      {(tipo_usuario === "gerente" ||
                        tipo_usuario === "admin") && (
                        <button
                          onClick={() => setEditingAgendamento(agendamento)}
                        >
                          Atualizar
                        </button>
                      )}
                      <button
                        onClick={() => handleVerAgenda(agendamento.id_agenda)}
                      >
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
