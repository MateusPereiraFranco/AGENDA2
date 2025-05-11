import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { usePermissionCheck } from '../hooks/usePermissionCheck';
import { useAuth } from '../context/AuthContext';

const ProtectedUsuarioRoute = () => {
    const { id } = useParams();
    const { isLoading: authLoading } = useAuth();

    const { accessLoading, granted, unauthenticated } = usePermissionCheck({
        pageType: 'usuario',
        pageId: id, // 👈 Seguro, pode ser undefined/null
    });

    if (authLoading || accessLoading) {
        return <div>Carregando...</div>;
    }

    if (unauthenticated) {
        return <Navigate to="/login" replace />;
    }

    return granted ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedUsuarioRoute;
