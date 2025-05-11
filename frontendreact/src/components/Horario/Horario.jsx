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

//icons
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchAgendamentoData, fetchAgendamentos, fetchAgendamentosFkUsuarioId } from "../../services/agendaService";
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
  const [dataAgenda, setDataAgenda] = useState('');
  const [error, setError] = useState("");
  const [hasMorePages, setHasMorePages] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [contato, setContato] = useState("");
  const [detalhesVisiveis, setDetalhesVisiveis] = useState({});
  const itemsPerPage = 10;

  useEffect(() => {
    loadHorarios();
    loadUsuarioNameLogado();
    getFkUsuarioIdAgendaECarregaNome();
    getDataAgenda();
  }, [currentPage, searchParams]);

  // Função genérica para toggles
  const toggleStateById = (id, setState) => {
    setState(prev => {
      return { ...prev, [id]: !prev[id] };
    });
  };

  const toggleDetalhes = (id) => toggleStateById(id, setDetalhesVisiveis);


  const handleContatoChange = (e) => {
    const input = e.target.value.replace(/\D/g, '');
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
    }
    catch (error) {
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
    if (!horarioCompleto) return '';
    const partes = horarioCompleto.split(':');
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
      fk_agenda_id: id,
    };
    try {
      await addHorario({ horario }, id_usuario);
      loadHorarios();
      e.target.reset();
      setContato("");
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

  return (
    <div className="horarios_container_geral">
      <ToastContainer
        autoClose={1500}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />
      <h1>{usuarioNome}</h1>
      <hr />
      <div className="form_horario">
        <form className="add_horario" onSubmit={handleAddHorario}>
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
          <input type="text" name="observacoes" placeholder="Observação (Opcional)" />
          <button className="botao_verde" type="submit">Adicionar Horário</button>
        </form>
      </div>
      <div className="tabela_horario">
        <table>
          <thead>
            <tr>
              <td colSpan='4'><h2>{dataAgenda}</h2></td>
            </tr>
          </thead>
          <tbody>
            {horarios.length > 0 ? (
              horarios.map((horario) => (
                <React.Fragment key={horario.id_horario}>
                  <tr>
                    <td>{formatarHorarioSemSegundos(horario.horario)}</td>
                    <td>{horario.nome}</td>
                    <td className="botaoNoCanto">
                      <button
                        className="botao-vermelho"
                        onClick={() => handleDeleteHorario(horario.id_horario)}
                        disabled={deletingId === horario.id_horario}
                      >
                        {deletingId === horario.id_horario ? <RotateRightIcon className="loading" /> : <DeleteIcon />}
                      </button>
                      <button className="botao_azul" onClick={() => toggleDetalhes(horario.id_horario)}>
                        {detalhesVisiveis[horario.id_horario] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </button>
                    </td>
                  </tr>
                  {detalhesVisiveis[horario.id_horario] && (
                    <tr>
                      <td colSpan="4">
                        <div className="info_horario">
                          <p><strong>Contato:</strong> {horario.contato}</p>
                          <p><strong>Obs:</strong> {horario.observacoes}</p>
                          <p><strong>Agendado Por:</strong> {horario.agendadopor}</p>
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
