import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { fetchUsuarios } from './usuarioService';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { id } = useParams(); // ID da URL (pode ser id_usuario ou id_agenda)
    const location = useLocation();
    const tipoUsuario = localStorage.getItem('tipo_usuario');
    const idUsuario = localStorage.getItem('id_usuario');
    const fkEmpresaId = localStorage.getItem('fk_empresa_id');
    const [donoEmpresaId, setDonoEmpresaId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Só executa para gerentes/secretários acessando agenda de outro usuário
        if ((tipoUsuario === 'gerente' || tipoUsuario === 'secretario') &&
            location.pathname.startsWith('/agenda') &&
            id && id !== idUsuario) {

            const fetchEmpresaDono = async () => {
                setLoading(true);
                try {
                    // Busca o usuário dono da agenda
                    const usuarios = await fetchUsuarios(fkEmpresaId, { id_usuario: id });
                    console.log(usuarios)
                    if (usuarios) {
                        setDonoEmpresaId(usuarios[0].fk_empresa_id);
                    } else {
                        // Usuário não encontrado ou não pertence à empresa
                        setDonoEmpresaId(null);
                    }
                } catch (error) {
                    console.error('Erro ao verificar empresa do usuário:', error);
                    setDonoEmpresaId(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchEmpresaDono();
        }
    }, [id, tipoUsuario, idUsuario, fkEmpresaId, location.pathname]);

    if (authLoading || loading) {
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
            if (location.pathname.startsWith('/usuario') && id !== fkEmpresaId) {
                return <Navigate to={`/usuario/${fkEmpresaId}`} />;
            }
            if (location.pathname.startsWith('/agenda')) {
                // Se acessando agenda de outro usuário
                if (id && id !== idUsuario) {
                    // Se o dono da agenda não pertence à mesma empresa
                    if (donoEmpresaId && donoEmpresaId !== fkEmpresaId) {
                        return <Navigate to={`/usuario/${fkEmpresaId}`} />;
                    }
                    // Se não conseguiu verificar a empresa
                    if (donoEmpresaId === null) {
                        return <Navigate to={`/usuario/${fkEmpresaId}`} />;
                    }
                }
            }
            return <Outlet />;

        case 'funcionario':
            if (location.pathname.startsWith('/usuario')) {
                return <Navigate to={`/agenda/${idUsuario}`} />;
            }
            if (location.pathname.startsWith('/agenda')) {
                if (id && id !== idUsuario) {
                    return <Navigate to={`/agenda/${idUsuario}`} />;
                }
            }
            return <Outlet />;

        default:
            return <Navigate to="/login" />;
    }
};

export default ProtectedRoute;