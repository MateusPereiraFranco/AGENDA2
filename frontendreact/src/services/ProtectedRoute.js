import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth(); // Verifica se o usuário está autenticado

    // Se o usuário não estiver autenticado, redirecione para a página de login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Se o usuário estiver autenticado, renderize a rota solicitada
    return <Outlet />;
};

export default ProtectedRoute;