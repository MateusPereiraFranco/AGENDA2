import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';
import { httpClient } from './fetchWithAuth';

// Função para buscar horários de uma agenda
export const fetchHorarios = async (fk_agenda_id, searchParams = {}) => {
    try {
        const params = new URLSearchParams({
            ...searchParams,
            fk_agenda_id
        }).toString();

        return await httpClient(`/times?${params}`);
    } catch (error) {
        console.error('Erro no fetchHorarios:', error);
        throw error;
    }
};

// Função para adicionar um horário
export const addHorario = async (horario, fk_usuario_id) => {
    try {
        const payload = { ...horario, fk_usuario_id };
        return await httpClient('/addTime', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Erro ao adicionar horário:', error.message);
        throw error;
    }
};

// Função para deletar um horário
export const deleteHorario = async (id) => {
    try {
        return await httpClient(`/deleteTime/${id}`, {
            method: 'DELETE'
        });
    } catch (error) {
        handleError(error);
        return null;
    }
};

// Função para atualizar um horario
export const updateHorario = async (id, horario) => {
    try {
        return await httpClient(`/updateTime/${id}`, {
            method: 'PUT',
            body: JSON.stringify(horario)
        });
    } catch (error) {
        console.error('Erro ao atualizar horário:', error.message);
        throw error;
    }
};