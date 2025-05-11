import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedEmpresaRoute = () => {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();

    if (authLoading) {
        return <div>Carregando página da empresa...</div>;
    }

    const isAdmin = user.tipo_usuario == 'admin';

    return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedEmpresaRoute;
