import { API_URL } from './apiConfig';

// Função para buscar empresas
export const fetchEmpresas = async (searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/enterprises?${queryString}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
    }
    return response.json();
    // Mudar a forma de busca para aceitar apenas 1 das buscas. ele necessita das 2 informações
};

// Função para adicionar uma empresa
export const addEmpresa = async (empresa) => {
    const response = await fetch(`${API_URL}/addEnterprise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa),
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar empresa');
    }
    return response.json();
};

// Função para atualizar uma empresa
export const updateEmpresa = async (id, empresa) => {
    const response = await fetch(`${API_URL}/updateEnterprise/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa),
    });
    if (!response.ok) {
        throw new Error('Erro ao atualizar empresa');
    }
    return response.json();
};

// Função para deletar uma empresa
export const deleteEmpresa = async (id) => {
    const response = await fetch(`${API_URL}/deleteEnterprise`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir empresa');
    }
    return response.json();
};
