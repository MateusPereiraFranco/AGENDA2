import { API_URL } from './apiConfig';

export const getPermissionStatus = async (pageType, hashid) => {
    const res = await fetch(`${API_URL}/permission/${pageType}/${hashid}`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await res.json(); // ✅ parsear a resposta JSON

    return data.granted;
}