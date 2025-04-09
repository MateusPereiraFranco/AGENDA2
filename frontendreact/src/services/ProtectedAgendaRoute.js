import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { usePermissionCheck } from '../hooks/usePermissionCheck';

const ProtectedAgendaRoute = () => {
    const { id } = useParams();
    const { authLoading, accessLoading, granted, unauthenticated } = usePermissionCheck({
        pageType: 'agenda',
        pageId: id,
    });

    if (authLoading || accessLoading) {
        return <div>Carregando agendas...</div>;
    }

    if (unauthenticated) {
        return <Navigate to="/login" replace />;
    }

    return granted ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedAgendaRoute;
