import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth(); // Verifica se o usuário está autenticado e se está carregando
    const { id } = useParams(); // Captura o parâmetro da URL (id_usuario, fk_empresa_id, etc.)
    const tipoUsuario = localStorage.getItem('tipo_usuario');
    const idUsuario = localStorage.getItem('id_usuario');
    const fkEmpresaId = localStorage.getItem('fk_empresa_id');

    if (isLoading) {
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
            if (window.location.pathname.startsWith('/usuario') && id !== fkEmpresaId) {
                return <Navigate to={`/usuario/${fkEmpresaId}`} />; // Redireciona para a página da empresa do usuário
            }
            if (window.location.pathname.startsWith('/agenda')) {
                // Verifica se o funcionário pertence à mesma empresa
                const funcionarioEmpresaId = localStorage.getItem(`empresa_do_funcionario_${id}`);
                if (funcionarioEmpresaId && funcionarioEmpresaId !== fkEmpresaId) {
                    return <Navigate to={`/usuario/${fkEmpresaId}`} />; // Redireciona para a página da empresa do usuário
                }
            }
            return <Outlet />;

        case 'funcionario':
            if (id && id !== idUsuario) {
                return <Navigate to={`/agenda/${idUsuario}`} />;
            }
            return <Outlet />;

        default:
            return <Navigate to="/login" />;
    }

};

export default ProtectedRoute;