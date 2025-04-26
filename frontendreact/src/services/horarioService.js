import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para buscar horários de uma agenda
export const fetchHorarios = async (fk_agenda_id, searchParams = {}) => {
    try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`${API_URL}/times?${queryString}&fk_agenda_id=${fk_agenda_id}`, {
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

// Função para adicionar um horário
export const addHorario = async (horario) => {
    try {
        const response = await fetch(`${API_URL}/addTime`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(horario),
            credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao adicionar horário');
        }
        return data;
    } catch (error) {
        console.error('Erro ao adicionar horário:', error.message);
        throw error;
    }
};

// Função para deletar um horário
export const deleteHorario = async (id) => {
    try {
        const response = await fetch(`${API_URL}/deleteTime`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir horário');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};

// Função para atualizar um horario
export const updateHorario = async (id, horario) => {
    try {
        const response = await fetch(`${API_URL}/updateSchedule/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(horario),
            credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao adicionar horário');
        }
        return data;
    } catch (error) {
        console.error('Erro ao adicionar horário:', error.message);
        throw error;
    }

};