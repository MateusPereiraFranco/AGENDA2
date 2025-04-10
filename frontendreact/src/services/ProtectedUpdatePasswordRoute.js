import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissionCheck } from '../hooks/usePermissionCheck';

const ProtectedUpdatePasswordRoute = () => {
    const {
        authLoading,
        accessLoading,
        granted,
        unauthenticated,
    } = usePermissionCheck({
        pageType: 'atualizar-senha',
        pageId: 'self', // só para manter a estrutura
    });

    if (authLoading || accessLoading) {
        return <div>Carregando permissões...</div>; // ou um Spinner
    }

    if (unauthenticated) {
        return <Navigate to="/login" />;
    }


    return granted ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedUpdatePasswordRoute;
