import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedEmpresaRoute = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const tipoUsuario = localStorage.getItem('tipo_usuario');

    if (authLoading) {
        return <div>Carregando página da empresa...</div>;
    }

    const isAdmin = tipoUsuario === 'admin';

    return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/notfound" replace />;
};

export default ProtectedEmpresaRoute;
