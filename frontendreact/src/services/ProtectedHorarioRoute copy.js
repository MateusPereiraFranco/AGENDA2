import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { usePermissionCheck } from '../hooks/usePermissionCheck';
import { useAuth } from '../context/AuthContext';

const ProtectedHorarioRoute = () => {

    const { id } = useParams();
    const { isLoading: authLoading } = useAuth();

    const { accessLoading, granted, unauthenticated } = usePermissionCheck({
        pageType: 'horario',
        pageId: id // 👈 Seguro, pode ser undefined/null
    });

    if (authLoading || accessLoading) {
        return <div>Carregando horarios...</div>;
    }

    if (unauthenticated) {
        return <Navigate to="/login" replace />;
    }

    return granted ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedHorarioRoute;
