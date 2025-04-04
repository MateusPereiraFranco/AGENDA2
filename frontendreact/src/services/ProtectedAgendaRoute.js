import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { fetchUsuarios } from './usuarioService';

const ProtectedAgendaRoute = () => {
    // 1. Todos os hooks no topo
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [accessState, setAccessState] = useState({
        loading: true,
        granted: false,
        shouldRedirect: false,
        redirectPath: null
    });

    // 2. Obter valores do localStorage
    const tipoUsuario = localStorage.getItem('tipo_usuario');
    const idUsuario = localStorage.getItem('id_usuario');
    const fkEmpresaId = localStorage.getItem('fk_empresa_id');

    // 3. Verificação de autenticação inicial
    useEffect(() => {
        if (!idUsuario || !tipoUsuario || !fkEmpresaId) {
            navigate('/login', { replace: true });
        }
    }, [idUsuario, tipoUsuario, fkEmpresaId, navigate]);

    // 4. Efeito principal para verificação de acesso
    useEffect(() => {
        let isMounted = true;

        if (!idUsuario || !tipoUsuario || !fkEmpresaId) return;

        const checkAccess = async () => {
            if (!isMounted) return;

            setAccessState(prev => ({ ...prev, loading: true }));

            if (!isAuthenticated) {
                return isMounted && setAccessState({
                    loading: false,
                    granted: false,
                    shouldRedirect: true,
                    redirectPath: '/login'
                });
            }

            // Admin tem acesso total
            if (tipoUsuario === 'admin') {
                return isMounted && setAccessState({
                    loading: false,
                    granted: true,
                    shouldRedirect: false,
                    redirectPath: null
                });
            }

            // Acesso à própria agenda
            if (id && id === idUsuario) {
                return isMounted && setAccessState({
                    loading: false,
                    granted: true,
                    shouldRedirect: false,
                    redirectPath: null
                });
            }

            // Verificação para gerentes/secretários
            if ((tipoUsuario === 'gerente' || tipoUsuario === 'secretario') && id && id !== idUsuario) {
                try {
                    const response = await fetchUsuarios(fkEmpresaId, { id: id });

                    if (!response || response.length === 0 || response[0].fk_empresa_id != fkEmpresaId) {
                        return isMounted && setAccessState({
                            loading: false,
                            granted: false,
                            shouldRedirect: true,
                            redirectPath: `/usuario/${fkEmpresaId}`
                        });
                    }

                    return isMounted && setAccessState({
                        loading: false,
                        granted: true,
                        shouldRedirect: false,
                        redirectPath: null
                    });
                } catch (error) {
                    console.error('Erro na verificação:', error);
                    return isMounted && setAccessState({
                        loading: false,
                        granted: false,
                        shouldRedirect: true,
                        redirectPath: `/usuario/${fkEmpresaId}`
                    });
                }
            }

            // Funcionário tentando acessar outra agenda
            if (tipoUsuario === 'funcionario' && id && id !== idUsuario) {
                return isMounted && setAccessState({
                    loading: false,
                    granted: false,
                    shouldRedirect: true,
                    redirectPath: `/agenda/${idUsuario}`
                });
            }

            // Caso padrão (sem ID ou acesso negado)
            return isMounted && setAccessState({
                loading: false,
                granted: false,
                shouldRedirect: true,
                redirectPath: tipoUsuario === 'funcionario' ? `/agenda/${idUsuario}` : `/usuario/${fkEmpresaId}`
            });
        };

        checkAccess();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, authLoading, id, tipoUsuario, idUsuario, fkEmpresaId, location.key]);

    // 5. Efeito para redirecionamentos
    useEffect(() => {
        if (accessState.shouldRedirect && accessState.redirectPath && !accessState.loading) {
            navigate(accessState.redirectPath, { replace: true });
        }
    }, [accessState, navigate]);

    // 6. Renderização condicional
    if (authLoading || accessState.loading) {
        return <div className="loading-screen">Carregando agenda...</div>;
    }

    if (!isAuthenticated || !idUsuario || !tipoUsuario || !fkEmpresaId) {
        return null;
    }

    return accessState.granted ? <Outlet /> : null;
};

export default ProtectedAgendaRoute;