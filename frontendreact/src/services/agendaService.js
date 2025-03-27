import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para buscar agendamentos de um usuário
export const fetchAgendamentos = async (userId, searchParams = {}) => {
    try {
        // Cria uma cópia segura dos parâmetros
        const params = new URLSearchParams();

        // Adiciona os parâmetros de busca
        if (searchParams.data) params.append('data', searchParams.data);
        if (searchParams.page) params.append('page', searchParams.page);

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
        console.log(id)
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