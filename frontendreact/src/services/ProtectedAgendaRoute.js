import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { fetchUsuarios } from './usuarioService';

const ProtectedAgendaRoute = () => {
    // 1. Todos os hooks no topo (regra do React)
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [accessState, setAccessState] = useState({
        loading: true,
        granted: false,
        shouldRedirect: false
    });

    // 2. Obter valores do localStorage
    const tipoUsuario = localStorage.getItem('tipo_usuario');
    const idUsuario = localStorage.getItem('id_usuario');
    const fkEmpresaId = localStorage.getItem('fk_empresa_id');

    // 3. Verificação de autenticação inicial - agora dentro de um useEffect
    useEffect(() => {
        if (!idUsuario || !tipoUsuario || !fkEmpresaId) {
            navigate('/login', { replace: true });
        }
    }, [idUsuario, tipoUsuario, fkEmpresaId, navigate]);

    // 4. Efeito principal para verificação de acesso
    useEffect(() => {
        let isMounted = true;

        // Se faltar dados essenciais, não prosseguir
        if (!idUsuario || !tipoUsuario || !fkEmpresaId) return;

        const checkAccess = async () => {
            if (!isMounted) return;

            setAccessState({
                loading: true,
                granted: false,
                shouldRedirect: false
            });

            if (!isAuthenticated) {
                return isMounted && setAccessState({
                    loading: false,
                    granted: false,
                    shouldRedirect: true
                });
            }

            if (tipoUsuario === 'admin' || (id && id === idUsuario)) {
                return isMounted && setAccessState({
                    loading: false,
                    granted: true,
                    shouldRedirect: false
                });
            }

            if ((tipoUsuario === 'gerente' || tipoUsuario === 'secretario') && id && id !== idUsuario) {
                try {
                    const response = await fetchUsuarios(fkEmpresaId, { id: id });

                    if (!response || response.length === 0 || response[0].fk_empresa_id != fkEmpresaId) {
                        return isMounted && setAccessState({
                            loading: false,
                            granted: false,
                            shouldRedirect: true
                        });
                    }

                    return isMounted && setAccessState({
                        loading: false,
                        granted: true,
                        shouldRedirect: false
                    });
                } catch (error) {
                    console.error('Erro na verificação:', error);
                    return isMounted && setAccessState({
                        loading: false,
                        granted: false,
                        shouldRedirect: true
                    });
                }
            }

            return isMounted && setAccessState({
                loading: false,
                granted: tipoUsuario === 'funcionario' && (!id || id === idUsuario),
                shouldRedirect: tipoUsuario === 'funcionario' && id && id !== idUsuario
            });
        };

        checkAccess();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, authLoading, id, tipoUsuario, idUsuario, fkEmpresaId, location.key]);

    // 5. Efeito para redirecionamentos
    useEffect(() => {
        if (accessState.shouldRedirect && !accessState.loading) {
            navigate(`/agenda/${idUsuario}`, { replace: true });
        }
    }, [accessState.shouldRedirect, accessState.loading, navigate, idUsuario]);

    // 6. Renderização condicional (agora sem early return)
    if (authLoading || accessState.loading) {
        return <div className="loading-screen">Carregando agenda...</div>;
    }

    if (!isAuthenticated || !idUsuario || !tipoUsuario || !fkEmpresaId) {
        return null; // O redirecionamento já está sendo tratado nos effects
    }

    return accessState.granted ? <Outlet /> : null;
};

export default ProtectedAgendaRoute;