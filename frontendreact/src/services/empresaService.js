import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';
import { httpClient } from './fetchWithAuth';

// Função para buscar empresas
export const fetchEmpresas = async (searchParams = {}) => {
    try {
        const queryString = new URLSearchParams(searchParams).toString();
        return await httpClient(`/enterprises?${queryString}`);
    } catch (error) {
        handleError(error);
        return null;
    }
};

export const fetchEmpresaNome = async (id) => {
    try {
        const data = await httpClient(`/enterpriseName/${id}`);
        return data.nome;
    } catch (error) {
        handleError(error);
        return null;
    }
};



export const addEmpresa = async (empresa) => {
    try {
        return await httpClient('/addEnterprise', {
            method: 'POST',
            body: JSON.stringify(empresa),
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// Função para atualizar uma empresa
export const updateEmpresa = async (id, empresa) => {
    try {
        return await httpClient(`/updateEnterprise/${id}`, {
            method: 'PUT',
            body: JSON.stringify(empresa),
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// Função para deletar uma empresa
export const deleteEmpresa = async (id) => {
    try {
        return await httpClient(`/deleteEnterprise/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        handleError(error);
        return null;
    }
};