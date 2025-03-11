import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para fazer login
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include', // Inclui cookies na requisição
        });
        if (!response.ok) {
            throw new Error('Erro ao fazer login');
        }
        return response.json();
    } catch (error) {
        handleError(error);
        alert('Não foi possível fazer login. Verifique suas credenciais e tente novamente.');
        return null;
    }
};


// Função para pegar o id da empresa que o usuario a logar tem.
export const get_fk_empresa_id = async (email) => {
    try {
        const userResponse = await fetch(`${API_URL}/users?email=${email}`, {
            credentials: 'include', // Inclui cookies na requisição
        });
        const userData = await userResponse.json();
        if (userResponse.ok && userData && userData.length > 0) {
            return userData[0]; // Retorna o primeiro usuário encontrado
        } else {
            throw new Error('Email não encontrado no banco');
        }
    } catch (error) {
        handleError(error);
        alert('Erro ao buscar informações do usuário. Tente novamente mais tarde.');
        return null;
    }
};
