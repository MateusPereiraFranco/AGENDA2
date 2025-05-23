import { API_URL } from './apiConfig';
import { refreshAccessToken } from './refreshService'; // você vai criar isso também


export const httpClient = async (url, options = {}, retry = true) => {
    const fullUrl = `${API_URL}${url}`;
    const config = {
        ...options,
        credentials: 'include', // necessário para enviar os cookies HTTP-only
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(fullUrl, config);

        // Se o access token expirou
        if (response.status === 401 && retry) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry apenas uma vez
                return httpClient(url, options, false);
            }
        }

        // Lida com erro manual
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || 'Erro na requisição';

            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = errorData;

            throw error;
        }

        // Retorna JSON diretamente
        return await response.json();
    } catch (err) {
        console.error(`[httpClient] Erro em ${url}:`, err);
        throw err;
    }
};
