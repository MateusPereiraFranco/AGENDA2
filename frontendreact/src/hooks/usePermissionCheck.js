// src/hooks/usePermissionCheck.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPermissionStatus } from '../services/permissionService';
import { useUserId } from './useUserId';

export const usePermissionCheck = ({ pageType, pageId }) => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const userId = useUserId();
    const [accessState, setAccessState] = useState({
        loading: true,
        granted: false,
        unauthenticated: false,
    });

    useEffect(() => {
        const verificar = async () => {
            if (authLoading || !userId) return;

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
                setAccessState({ loading: false, granted: false, unauthenticated: false });
            }
        };

        verificar();
    }, [authLoading, isAuthenticated, userId, pageType, pageId]);

    return {
        authLoading,
        accessLoading: authLoading || accessState.loading,
        granted: accessState.granted,
        unauthenticated: accessState.unauthenticated,
    };
};