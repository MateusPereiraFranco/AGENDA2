import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';
import { httpClient } from './fetchWithAuth';


// Função para buscar usuários de uma empresa
export const fetchUsuarios = async (fk_empresa_id, searchParams = {}) => {
    try {
        const params = new URLSearchParams({
            ...searchParams,
            fk_empresa_id,
        }).toString();

        return await httpClient(`/users?${params}`);
    } catch (error) {
        handleError(error);
        return null;
    }
};

export const fetchUsuarioNome = async (id) => {
    try {
        const data = await httpClient(`/usuarioName/${id}`);
        return data.nome;
    } catch (error) {
        handleError(error);
        return null;
    }
};


// Função para deletar um usuário
export const deleteUsuario = async (id) => {
    try {
        return await httpClient(`/deleteUser/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        handleError(error);
        return null;
    }
};


// Função para atualizar um usuário
export const updateUsuario = async (id, usuario) => {
    try {
        return await httpClient(`/updateUser/${id}`, {
            method: 'PUT',
            body: JSON.stringify(usuario),
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};


// Função para adicionar um usuário
export const addUsuario = async (usuario) => {
    try {
        return await httpClient('/addUser', {
            method: 'POST',
            body: JSON.stringify(usuario),
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};