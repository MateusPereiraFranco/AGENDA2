import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';
import { httpClient } from './fetchWithAuth';

export const fetchAgendamentosFkUsuarioId = async (id) => {
    try {
        return await httpClient(`/scheduleFkUserId/${id}`);
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const fetchAgendamentoData = async (id) => {
    try {
        return await httpClient(`/scheduleData/${id}`);
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// Função para buscar agendamentos de um usuário
export const fetchAgendamentos = async (userId, searchParams = {}) => {
    try {
        const params = new URLSearchParams({
            ...searchParams,
            fk_usuario_id: userId,
        }).toString();

        return await httpClient(`/schedules?${params}`);
    } catch (error) {
        handleError(error);
        throw error;
    }
};


// Função para deletar um agendamento
export const deleteAgendamento = async (id) => {
    try {
        return await httpClient(`/deleteSchedule/${id}`, {
            method: 'DELETE'
        });
    } catch (error) {
        handleError(error);
        return null;
    }
};
// Função para atualizar um agendamento
export const updateAgendamento = async (id, agendamento) => {
    try {
        return await httpClient(`/updateSchedule/${id}`, {
            method: 'PUT',
            body: JSON.stringify(agendamento)
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};


// Função para adicionar um agendamento
export const addAgendamento = async (agendamento, fk_usuario_id) => {
    try {
        const payload = { ...agendamento, fk_usuario_id };
        return await httpClient('/addSchedule', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

