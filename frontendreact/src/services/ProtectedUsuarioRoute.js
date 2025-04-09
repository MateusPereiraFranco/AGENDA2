import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { usePermissionCheck } from '../hooks/usePermissionCheck';

const ProtectedUsuarioRoute = () => {
    const { id } = useParams();
    const { authLoading, accessLoading, granted, unauthenticated } = usePermissionCheck({
        pageType: 'usuario',
        pageId: id,
    });

    if (authLoading || accessLoading) {
        return <div>Carregando usuários...</div>;
    }

    if (unauthenticated) {
        return <Navigate to="/login" replace />;
    }

    return granted ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedUsuarioRoute;
