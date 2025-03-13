import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para buscar empresas
export const fetchEmpresas = async (searchParams = {}) => {
    try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`${API_URL}/enterprises?${queryString}`, {
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

// Função para adicionar uma empresa
export const addEmpresa = async (empresa) => {
    try {
        const response = await fetch(`${API_URL}/addEnterprise`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(empresa),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao adicionar empresa');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
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
        if (!response.ok) {
            throw new Error('Erro ao atualizar empresa');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
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