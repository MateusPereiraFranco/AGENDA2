import { API_URL } from './apiConfig';
import { handleError } from './errorHandler';

// Função para fazer login
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        return {
            success: true,
            message: 'Login bem-sucedido',
            token: data.token, // Adicione isso se seu backend retornar um token
            user: data.user // Adicione dados básicos do usuário se disponível
        };

    } catch (error) {
        console.error('Erro no serviço de login:', error);
        return {
            success: false,
            message: error.message || 'Não foi possível fazer login'
        };
    }
};


// Função para pegar o id da empresa que o usuario a logar tem.
/*export const get_fk_empresa_id = async (email) => {
    try {
        const userResponse = await fetch(`${API_URL}getEmail?email=${email}`, {
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
};*/

export const get_fk_empresa_id = async (email) => {
    try {
        const response = await fetch(`${API_URL}/getEmail?email=${encodeURIComponent(email)}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.message || 'Usuário não encontrado');
        }

        return result.data; // Retorna diretamente o objeto do usuário

    } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        throw error; // Propaga o erro para ser tratado no componente
    }
};