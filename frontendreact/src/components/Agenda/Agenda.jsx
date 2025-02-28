import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAgendamentos, addAgendamento, deleteAgendamento, updateAgendamento } from '../../services/api';

function Agenda() {
  const { id } = useParams();
  const [agendamentos, setAgendamentos] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadAgendamentos();
  }, [currentPage, searchParams]);

  const loadAgendamentos = async () => {
    try {
      const data = await fetchAgendamentos(id, { ...searchParams, page: currentPage });
      setAgendamentos(data);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar agendamentos');
    }
  };

  const handleAddAgendamento = async (e) => {
    e.preventDefault();
    const data = e.target.data.value;
    try {
      await addAgendamento({ data, fk_usuario_id: id });
      loadAgendamentos();
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar agendamento');
    }
  };

  const handleDeleteAgendamento = async (id) => {
    try {
      await deleteAgendamento(id);
      loadAgendamentos();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir agendamento');
    }
  };

  const handleUpdateAgendamento = async (id) => {
    const data = prompt('Nova data do agendamento:');
    if (!data) {
      alert('O campo é obrigatório!');
      return;
    }
    try {
      await updateAgendamento(id, { data });
      loadAgendamentos();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar agendamento');
    }
  };

  const handleVerAgenda = (id) => {
    navigate(`/horario/${id}`);
  };

  return (
    <div>
      <h1>Agendamentos</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="date"
          placeholder="Buscar por data"
          onChange={(e) => setSearchParams({ data: e.target.value })}
        />
        <button type="submit">Buscar</button>
      </form>
      <form onSubmit={handleAddAgendamento}>
        <input type="date" name="data" placeholder="Data" required />
        <button type="submit">Adicionar Agendamento</button>
      </form>
      <ul>
        {agendamentos.map((agendamento) => (
          <li key={agendamento.id_agenda}>
            {agendamento.data}
            <button onClick={() => handleDeleteAgendamento(agendamento.id_agenda)}>Excluir</button>
            <button onClick={() => handleUpdateAgendamento(agendamento.id_agenda)}>Atualizar</button>
            <button onClick={() => handleVerAgenda(agendamento.id_agenda)}>Ver Agenda</button>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <button onClick={() => setCurrentPage(currentPage + 1)}>Próxima</button>
      </div>
    </div>
  );
}

export default Agenda;