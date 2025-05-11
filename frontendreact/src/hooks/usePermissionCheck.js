// src/hooks/usePermissionCheck.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPermissionStatus } from '../services/permissionService';

export const usePermissionCheck = ({ pageType, pageId }) => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [accessState, setAccessState] = useState({
        loading: true,
        granted: false,
        unauthenticated: false,
    });

    useEffect(() => {
        const verificar = async () => {
            if (authLoading || !user) return;

            if (!isAuthenticated) {
                return setAccessState({
                    loading: false,
                    granted: false,
                    unauthenticated: true,
                });
            }
            try {
                const granted = await getPermissionStatus(pageType, pageId);

                setAccessState({ loading: false, granted: granted, unauthenticated: false });
            } catch (error) {
                console.error('Erro ao verificar permissão:', error);
                setAccessState({ loading: false, granted: false, unauthenticated: false });
            }
        };

        verificar();
    }, [authLoading, isAuthenticated, user, pageType, pageId]);

    return {
        authLoading,
        accessLoading: authLoading || accessState.loading,
        granted: accessState.granted,
        unauthenticated: accessState.unauthenticated,
    };
};