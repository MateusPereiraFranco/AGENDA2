import { API_URL } from "./apiConfig";

export const refreshAccessToken = async () => {
    try {
        const response = await fetch(`${API_URL}/refresh-token`, {
            method: 'POST',
            credentials: 'include', // envia o refresh_token do cookie
        });

        if (!response.ok) {
            throw new Error('Não foi possível renovar o token');
        }

        return true; // token renovado com sucesso
    } catch (error) {
        console.error('Erro ao renovar token:', error);
        return false;
    }
};