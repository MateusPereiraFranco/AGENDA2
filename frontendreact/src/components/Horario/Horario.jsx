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
      // Cria uma cópia do searchParams para evitar mutação direta
      const params = { ...searchParams };
        
      // Remove o campo "nome" se estiver vazio
      if (params.nome === '') {
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
        alert('Erro ao carregar usuários');
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

  const handleDeleteHorario = async (id) => {
    try {
      await deleteHorario(id);
      loadHorarios();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir horário');
    }
  };

  return (
    <div className='horarios_container_geral'>
      <h1>Horários</h1>
      <form className='add_horario' onSubmit={handleAddHorario}>
        <input type="time" name="horario" placeholder="Horário" required />
        <input type="text" name="nome" placeholder="Nome" required />
        <input type="text" name="contato" placeholder="Contato" required />
        <input type="text" name="observacoes" placeholder="Observações" required />
        <button type="submit">Adicionar Horário</button>
      </form>
      <div className="lista_horarios">
        <ul>
        {horarios.length > 0 ? (
          horarios.map((horario) => (
            <li key={horario.id_horario}>
              {horario.horario} - {horario.nome} - {horario.contato} - {horario.observacoes}
              <button onClick={() => handleDeleteHorario(horario.id_horario)}>Excluir</button>
            </li>
          ))
          ) : (
            <li>Não há horário cadastrado</li>
          )
          }
        </ul>
      </div>
      <div className='vai_volta'>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <button onClick={() => setCurrentPage(currentPage + 1)}>
          Próxima
        </button>
      </div>
    </div>
  );
}

export default Horario;