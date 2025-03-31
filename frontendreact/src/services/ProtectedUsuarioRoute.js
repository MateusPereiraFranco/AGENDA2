import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const ProtectedUsuarioRoute = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { id } = useParams();
    const location = useLocation();
    const tipoUsuario = localStorage.getItem('tipo_usuario');
    const fkEmpresaId = localStorage.getItem('fk_empresa_id');

    if (authLoading) {
        return <div>Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    switch (tipoUsuario) {
        case 'admin':
            return <Outlet />;

        case 'gerente':
        case 'secretario':
            // Verifica se está acessando a página de usuário da própria empresa
            if (location.pathname.startsWith('/usuario') && id !== fkEmpresaId) {
                return <Navigate to={`/usuario/${fkEmpresaId}`} />;
            }
            return <Outlet />;

        case 'funcionario':
            // Funcionários não podem acessar páginas de usuário
            return <Navigate to="/agenda" />;

        default:
            return <Navigate to="/login" />;
    }
};

export default ProtectedUsuarioRoute;