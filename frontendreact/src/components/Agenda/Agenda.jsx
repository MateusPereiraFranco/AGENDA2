import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAgendamentos, addAgendamento, deleteAgendamento, updateAgendamento } from '../../services/agendaService';

function Agenda() {
    const { id } = useParams();
    const [agendamentos, setAgendamentos] = useState([]);
    const [searchParams, setSearchParams] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const tipo_usuario = localStorage.getItem('tipo_usuario');
    const id_usuario = localStorage.getItem('id_usuario');

    useEffect(() => {
        loadAgendamentos();
    }, [currentPage, searchParams]);

    const loadAgendamentos = async () => {
        try {
            const params = { 
                page: currentPage,
                ...(searchParams.data && { data: searchParams.data })
            };
            
            const data = await fetchAgendamentos(id, params);
            setAgendamentos(data || []);
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            alert(error.message || 'Erro ao carregar agendamentos');
        }
    };

    const handleAddAgendamento = async (e) => {
        e.preventDefault();
        const data = e.target.data.value;
        
        const fk_usuario_id = tipo_usuario === 'funcionario' ? id_usuario : id;

        try {
            await addAgendamento({ data, fk_usuario_id});
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
        <div className='agenda_conteiner_geral'>
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
            <div className='tabela_agenda'>
                <table>
                  <tbody>
                    {agendamentos.length > 0 ? (
                      agendamentos.map((agendamento) => (
                        <tr key={agendamento.id_agenda}>
                          <td>{agendamento.data}</td>
                          <td>
                            <button className='botao-vermelho' onClick={() => handleDeleteAgendamento(agendamento.id_agenda)}>Excluir</button>
                            {(tipo_usuario === "gerente" ||
                                tipo_usuario === "admin") && (
                                    <button onClick={() => handleUpdateAgendamento(agendamento.id_agenda)}>Atualizar</button>
                            )}
                            <button onClick={() => handleVerAgenda(agendamento.id_agenda)}>Ver Agenda</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center' }}>Nenhum agendamento cadastrado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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

export default Agenda;