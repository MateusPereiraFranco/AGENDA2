import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para buscar horários de uma agenda
export const fetchHorarios = async (fk_agenda_id, searchParams = {}) => {

    const params = new URLSearchParams();

    if (searchParams.page) params.append('page', searchParams.page);
    if (searchParams.limit) params.append('limit', searchParams.limit);
    if (searchParams.sortBy) params.append('sortBy', searchParams.sortBy);
    if (searchParams.order) params.append('order', searchParams.order);
    params.append('fk_agenda_id', fk_agenda_id);

    try {
        const response = await fetch(`${API_URL}/times?${params.toString()}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Erro no fetchHorarios:');
        throw error;
    }
};

// Função para adicionar um horário
export const addHorario = async (horario, fk_usuario_id) => {
    try {
        const payload = {
            ...horario,
            fk_usuario_id, // necessário para controle de acesso no backend
        };

        const response = await fetch(`${API_URL}/addTime`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
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
        const response = await fetch(`${API_URL}/deleteTime/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
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