import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissionCheck } from '../hooks/usePermissionCheck';
import { useAuth } from '../context/AuthContext';

const ProtectedUpdatePasswordRoute = () => {

    const { isLoading: authLoading, user } = useAuth();

    const userId = user?.id_usuario || null;

    const { accessLoading, granted, unauthenticated } = usePermissionCheck({
        pageType: 'atualizar-senha',
        pageId: userId, // 👈 Seguro, pode ser undefined/null
    });

    if (authLoading || accessLoading) {
        return <div>Carregando...</div>; // ou um Spinner
    }

    if (unauthenticated) {
        return <Navigate to="/login" />;
    }

    return granted ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedUpdatePasswordRoute;
