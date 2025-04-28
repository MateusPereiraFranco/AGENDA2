import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

export const fetchAgendamentosFkUsuarioId = async (id) => {

    const response = await fetch(`${API_URL}/schedule/${id}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
    }

    return response.json();
}

export const fetchAgendamentoData = async (id) => {

    const response = await fetch(`${API_URL}/scheduleData/${id}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
    }

    return response.json();
};

// Função para buscar agendamentos de um usuário
export const fetchAgendamentos = async (userId, searchParams = {}) => {
    try {
        const params = new URLSearchParams();

        if (searchParams.page) params.append('page', searchParams.page);
        if (searchParams.limit) params.append('limit', searchParams.limit);
        if (searchParams.sortBy) params.append('sortBy', searchParams.sortBy);
        if (searchParams.order) params.append('order', searchParams.order);
        if (searchParams.dataInicio) params.append('dataInicio', searchParams.dataInicio);
        if (searchParams.dataFim) params.append('dataFim', searchParams.dataFim);

        params.append('fk_usuario_id', userId);

        const response = await fetch(`${API_URL}/schedules?${params.toString()}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Erro no fetchAgendamentos:', error);
        throw error;
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
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao adicionar agenda');
        }
        return data;
    } catch (error) {
        console.error('Erro ao atualizar agenda:', error.message);
        throw error;
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao adicionar agenda');
        }
        return data;
    } catch (error) {
        console.error('Erro ao adicionar agenda:', error.message);
        throw error;
    }
};