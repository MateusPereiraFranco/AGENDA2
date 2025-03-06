import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchHorarios, addHorario, deleteHorario } from '../../services/horarioService';

function Horario() {
  const { id } = useParams(); // Obtém o ID da agenda da URL
  const [horarios, setHorarios] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadHorarios();
  }, [currentPage, searchParams]);

  const loadHorarios = async () => {
    try {
      const data = await fetchHorarios(id, { ...searchParams, page: currentPage });
      setHorarios(data);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar horários');
    }
  };

  const handleAddHorario = async (e) => {
    e.preventDefault();
    const horario = {
      horario: e.target.horario.value,
      nome: e.target.nome.value,
      contato: e.target.contato.value,
      observacoes: e.target.observacoes.value,
      fk_agenda_id: id,
    };
    try {
      await addHorario(horario);
      loadHorarios();
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar horário');
    }
  };

  return (
    <div>
      <h1>Horários</h1>
      <form onSubmit={handleAddHorario}>
        <input type="time" name="horario" placeholder="Horário" required />
        <input type="text" name="nome" placeholder="Nome" required />
        <input type="text" name="contato" placeholder="Contato" required />
        <input type="text" name="observacoes" placeholder="Observações" required />
        <button type="submit">Adicionar Horário</button>
      </form>
      <ul>
        {horarios.map((horario) => (
          <li key={horario.id_horario}>
            {horario.horario} - {horario.nome} - {horario.contato} - {horario.observacoes}
            <button onClick={() => deleteHorario(horario.id_horario)}>Excluir</button>
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

export default Horario;