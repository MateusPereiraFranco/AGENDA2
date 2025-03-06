import { API_URL } from './apiConfig';

// Função para buscar agendamentos de um usuário
export const fetchAgendamentos = async (fk_usuario_id, searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/schedules?${queryString}&fk_usuario_id=${fk_usuario_id}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar agendamentos');
    }
    return response.json();
};


// Função para deletar um agendamento
export const deleteAgendamento = async (id) => {
    const response = await fetch(`${API_URL}/deleteSchedule`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir agendamento');
    }
    return response.json();
};

// Função para atualizar um agendamento
export const updateAgendamento = async (id, agendamento) => {
    const response = await fetch(`${API_URL}/updateSchedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento),
    });
    if (!response.ok) {
        throw new Error('Erro ao atualizar agendamento');
    }
    return response.json();
};

// Função para adicionar um agendamento
export const addAgendamento = async (agendamento) => {
    const response = await fetch(`${API_URL}/addSchedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento),
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar agendamento');
    }
    return response.json();
};