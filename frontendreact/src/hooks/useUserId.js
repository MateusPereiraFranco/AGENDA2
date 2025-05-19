import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export function useUserId() {
    const { user } = useAuth();

    return useMemo(() => {
        if (user && user.id_usuario) {
            return user.id_usuario;
        }

        const fromSession = sessionStorage.getItem('id_usuario');
        return fromSession ? fromSession : null;
    }, [user]);
}