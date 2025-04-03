import React, { useState, useEffect } from "react";
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

function Horario() {
  const { id } = useParams(); // Obtém o ID da agenda da URL
  const [horarios, setHorarios] = useState([]);
  const [searchParams, setSearchParams] = useState({
    sortBy: "horario"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [error, setError] = useState("");
  const [editingHorario, setEditingHorario] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const tipo_usuario = localStorage.getItem("tipo_usuario");
  const id_usuario = localStorage.getItem("id_usuario");

  useEffect(() => {
    loadHorarios();
    loadUsuarioName();
  }, [currentPage, searchParams]);

  const loadHorarios = async () => {
    try {
      // Cria uma cópia do searchParams para evitar mutação direta
      const params = { ...searchParams };

      // Remove o campo "nome" se estiver vazio
      if (params.nome === "") {
        delete params.nome;
      }

      // Adiciona a página atual aos parâmetros
      params.page = currentPage;

      // Busca os usuários com os parâmetros atualizados
      const data = await fetchHorarios(id, params);
      if (data) {
        setHorarios(data);
      } else {
        setHorarios([]); // Define a lista de usuários como vazia se não houver dados
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar usuários");
    }
  };

  // Usado para colocar em observação - "Agendado por 'João'".
  const loadUsuarioName = async () => {
        try {
          const nomeUsuario = await fetchUsuarioNome(id_usuario);
          if (nomeUsuario) {
            setUsuarioNome(nomeUsuario);
          } else {
            setUsuarioNome("Usuario não encontrada");
          }
        } catch (error) {
          console.error(error);
          setError("Erro ao carregar detalhes do usuario.");
        }
      };


  const handleAddHorario = async (e) => {
    e.preventDefault();
    const horario = {
      horario: e.target.horario.value,
      nome: e.target.nome.value,
      contato: e.target.contato.value,
      observacoes: `Agendado por ${usuarioNome}`,
      fk_agenda_id: id,
    };
    try {
      await addHorario(horario);
      loadHorarios();
      e.target.horario.value = "";
      e.target.nome.value = "";
      e.target.contato.value = "";
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar horário");
    }
  };

  const handleDeleteHorario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir o horário?")) return;

    setDeletingId(id);
    try {
      await deleteHorario(id);
      await loadHorarios();
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
    const horario = e.target.data.value;

    if (!horario) {
      alert("O campo é obrigatório!");
      return;
    }

    try {
      await updateHorario(editingHorario.id_horario, { horario });
      loadHorarios();
      setEditingHorario(null); // Fecha o formulário de edição
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar horario");
    }
  };

  return (
    <div className="horarios_container_geral">
      <ToastContainer
        autoClose={1500}
        pauseOnHover={false} // Fecha imediatamente ao passar o mouse
        pauseOnFocusLoss={false} // Fecha mesmo quando a janela perde foco
      />
      <h1>Horários</h1>
      <div className="form_horario">
        <form className="add_horario" onSubmit={handleAddHorario}>
          <input type="time" name="horario" placeholder="Horário" required />
          <input type="text" name="nome" placeholder="Nome" required />
          <input type="text" name="contato" placeholder="Contato" required />
          <button type="submit">Adicionar Horário</button>
        </form>
      </div>
      <div className="tabela_horario">
        <table>
          <tbody>
            {horarios.length > 0 ? (
              horarios.map((horario) => (
                <React.Fragment key={horario.id_horario}>
                  <tr key={horario.id_horario}>
                    <td>{horario.horario}</td>
                    <td>{horario.nome}</td>
                    <td>{horario.contato}</td>
                    <td>{horario.observacoes}</td>
                    <td>
                      <button
                        className="botao-vermelho"
                        onClick={() => handleDeleteHorario(horario.id_horario)}
                        disabled={deletingId === horario.id_horario}
                      >
                        {deletingId === horario.id_horario
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                      {(tipo_usuario === "gerente" ||
                        tipo_usuario === "admin") && (
                        <button onClick={() => setEditingHorario(horario)}>
                          Atualizar
                        </button>
                      )}
                    </td>
                  </tr>
                  {editingHorario &&
                    editingHorario.id_horario === horario.id_horario && (
                      <tr className="editando_agendamento">
                        <td colSpan="2">
                          <form
                            className="form-atualizacao"
                            onSubmit={handleUpdateHorario}
                          >
                            <label htmlFor="horario">Novo horario:</label>
                            <input
                              type="time"
                              name="horario"
                              defaultValue={editingHorario.horario}
                              required
                            />
                            <button type="submit">Salvar</button>
                            <button
                              type="button"
                              className="botao-vermelho"
                              onClick={() => setEditingHorario(null)}
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

export default Horario;
