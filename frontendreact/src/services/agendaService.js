import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para buscar agendamentos de um usuário
export const fetchAgendamentos = async (fk_usuario_id, searchParams = {}) => {
    try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`${API_URL}/schedules?${queryString}&fk_usuario_id=${fk_usuario_id}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            return null;
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};


// Função para deletar um agendamento
export const deleteAgendamento = async (id) => {
    try {
        const response = await fetch(`${API_URL}/deleteSchedule`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir agendamento');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};

// Função para atualizar um agendamento
export const updateAgendamento = async (id, agendamento) => {
    try {
        const response = await fetch(`${API_URL}/updateSchedule/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agendamento),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao atualizar agendamento');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }

};

// Função para adicionar um agendamento
export const addAgendamento = async (agendamento) => {
    try {
        const response = await fetch(`${API_URL}/addSchedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agendamento),
            credentials: 'include', // Inclui cookies na requisição
        });
        if (!response.ok) {
            throw new Error('Erro ao adicionar agendamento');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};