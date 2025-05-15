import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissionCheck } from '../hooks/usePermissionCheck';

const ProtectedEmpresaRoute = () => {
    const { user, isLoading: authLoading } = useAuth();

    console.log('user', user);
    const { accessLoading, granted, unauthenticated } = usePermissionCheck({
        pageType: 'empresa',
        pageId: user.id_usuario,
    });

    if (authLoading || accessLoading) {
        return <div>Carregando...</div>;
    }

    if (unauthenticated) {
        return <Navigate to="/login" replace />;
    }

    return granted ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedEmpresaRoute;
