import { httpClient } from './fetchWithAuth';

export const getPermissionStatus = async (pageType, hashid) => {
    const data = await httpClient(`/permission/${pageType}/${hashid}`);
    return data.granted;
};
