import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para buscar usuários de uma empresa
export const fetchUsuarios = async (fk_empresa_id, searchParams = {}) => {
    try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`${API_URL}/users?${queryString}&fk_empresa_id=${fk_empresa_id}`, {
            credentials: 'include', // Inclui cookies na requisição
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

// Função para deletar um usuário
export const deleteUsuario = async (id) => {
    try {
        const response = await fetch(`${API_URL}/deleteUser`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include', // Inclui cookies na requisição
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir usuário');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};

// Função para atualizar um usuário
export const updateUsuario = async (id, usuario) => {
    try {
        const response = await fetch(`${API_URL}/updateUser/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario),
            credentials: 'include', // Inclui cookies na requisição
        });
        if (!response.ok) {
            throw new Error('Erro ao atualizar usuário');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};

// Função para adicionar um usuário
export const addUsuario = async (usuario) => {
    try {
        const response = await fetch(`${API_URL}/addUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario),
            credentials: 'include', // Inclui cookies na requisição
        });
        if (!response.ok) {
            throw new Error('Erro ao adicionar usuário');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        return null;
    }
};
