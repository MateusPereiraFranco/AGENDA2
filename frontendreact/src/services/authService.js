import { API_URL } from './apiConfig';

import { httpClient } from './fetchWithAuth';

export const checkAuth = async () => {
    try {
        const data = await httpClient('/check-auth');

        return {
            authenticated: data.authenticated,
            user: data.user,
        };
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        throw new Error(error.message || 'Erro ao verificar autenticação');
    }
};

// Função para fazer login
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        const contentType = response.headers.get('content-type');

        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(text || 'Erro inesperado no login');
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        return {
            success: true,
            message: 'Login bem-sucedido',
            user: data.user
        };

    } catch (error) {
        console.error('Erro no serviço de login:', error);
        return {
            success: false,
            message: error.message || 'Não foi possível fazer login'
        };
    }
};
