import { API_URL } from './apiConfig';

// Função para fazer login
export const login = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!response.ok) {
        throw new Error('Erro ao fazer login');
    }
    return response.json();
};

// Função para pegar o id da empresa que o usuario a logar tem.
export const get_fk_empresa_id = async (email) => {
    const userResponse = await fetch(`${API_URL}/users?email=${email}`);
    const userData = await userResponse.json();
    console.log(userData[0])
    if (userResponse.ok) {
        return userData[0];
    }
    else {
        throw new Error('Email não encontrado no banco');
    }

};
