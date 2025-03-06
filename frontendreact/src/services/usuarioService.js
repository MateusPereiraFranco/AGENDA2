import { API_URL } from './apiConfig';

// Função para buscar usuários de uma empresa
export const fetchUsuarios = async (fk_empresa_id, searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/users?${queryString}&fk_empresa_id=${fk_empresa_id}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
    }
    return response.json();
};

// Função para deletar um usuário
export const deleteUsuario = async (id) => {
    const response = await fetch(`${API_URL}/deleteUser`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir usuário');
    }
    return response.json();
};

// Função para atualizar um usuário
export const updateUsuario = async (id, usuario) => {
    const response = await fetch(`${API_URL}/updateUser/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    if (!response.ok) {
        throw new Error('Erro ao atualizar usuário');
    }
    return response.json();
};

// Função para adicionar um usuário
export const addUsuario = async (usuario) => {
    const response = await fetch(`${API_URL}/addUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    if (!response.ok) {
        throw new Error('Erro ao adicionar usuário');
    }
    return response.json();
};
