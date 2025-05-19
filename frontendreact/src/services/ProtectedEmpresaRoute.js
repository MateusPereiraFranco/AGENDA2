import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissionCheck } from '../hooks/usePermissionCheck';
import { useUserId } from '../hooks/useUserId';

const ProtectedEmpresaRoute = () => {
    const { isLoading: authLoading } = useAuth();
    const userId = useUserId(); // Assuming this is a custom hook that retrieves the user ID

    const { accessLoading, granted, unauthenticated } = usePermissionCheck({
        pageType: 'empresa',
        pageId: userId,
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
