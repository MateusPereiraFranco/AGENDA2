import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para buscar horários de uma agenda
export const fetchHorarios = async (fk_agenda_id, searchParams = {}) => {
    try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`${API_URL}/times?${queryString}&fk_agenda_id=${fk_agenda_id}`);
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
        });
        if (!response.ok) {
            throw new Error('Erro ao adicionar horário');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};

// Função para deletar um horário
export const deleteHorario = async (id) => {
    try {
        const response = await fetch(`${API_URL}/deleteTime`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
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
