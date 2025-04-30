import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para buscar empresas
export const fetchEmpresas = async (searchParams = {}) => {
    try {
        const token = localStorage.getItem('token');
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`${API_URL}/enterprises?${queryString}`, {
            credentials: 'include', // Inclui cookies na requisição
            headers: {
                'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho
            },
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

export const fetchEmpresaNome = async (id) => {
    try {
        const response = await fetch(`${API_URL}/enterpriseName?id=${id}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            return null; // Retorna null se a resposta não for bem-sucedida
        }

        const data = await response.json();
        return data.nome; // Retorna o nome da empresa
    } catch (error) {
        handleError(error);
        return null;
    }
};


export const addEmpresa = async (empresa) => {
    try {
        const response = await fetch(`${API_URL}/addEnterprise`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(empresa),
            credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao cadastrar usuário');
        }

        return data;
    } catch (error) {
        console.error('Erro ao adicionar empresa:', error.message);
        throw error;
    }
};

// Função para atualizar uma empresa
export const updateEmpresa = async (id, empresa) => {
    try {
        const response = await fetch(`${API_URL}/updateEnterprise/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(empresa),
            credentials: 'include',
        });
        const data = await response.json(); // 👈 importante!

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao atualizar empresa');
        }

        return data;
    } catch (error) {
        console.error('Erro ao atualizar empresa:', error.message);
        throw error;
    }
};

// Função para deletar uma empresa
export const deleteEmpresa = async (id) => {
    try {
        const response = await fetch(`${API_URL}/deleteEnterprise`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir empresa');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};