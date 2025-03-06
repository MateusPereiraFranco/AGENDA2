import { API_URL } from './apiConfig';

// Função para buscar horários de uma agenda
export const fetchHorarios = async (fk_agenda_id, searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/times?${queryString}&fk_agenda_id=${fk_agenda_id}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar horários');
    }
    return response.json();
};

// Função para adicionar um horário
export const addHorario = async (horario) => {
    const response = await fetch(`${API_URL}/addTime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horario),
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar horário');
    }
    return response.json();
};

// Função para deletar um horário
export const deleteHorario = async (id) => {
    const response = await fetch(`${API_URL}/deleteTime`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir horário');
    }
    return response.json();
};
