// src/hooks/usePermissionCheck.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUsuarios } from '../services/usuarioService';

export const usePermissionCheck = ({ pageType, pageId }) => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [accessState, setAccessState] = useState({
        loading: true,
        granted: false,
        unauthenticated: false,
    });

    const tipoUsuario = localStorage.getItem('tipo_usuario');
    const idUsuario = localStorage.getItem('id_usuario');
    const fkEmpresaId = localStorage.getItem('fk_empresa_id');

    useEffect(() => {
        const verificar = async () => {
            if (authLoading || !pageId) return;

            if (!isAuthenticated || !tipoUsuario || !idUsuario || !fkEmpresaId) {
                return setAccessState({
                    loading: false,
                    granted: false,
                    unauthenticated: true,
                });
            }

            // Admin tem acesso total
            if (tipoUsuario === 'admin') {
                return setAccessState({ loading: false, granted: true, unauthenticated: false });
            }

            // AGENDA
            if (pageType === 'agenda') {
                if (idUsuario === pageId) return setAccessState({ loading: false, granted: true, unauthenticated: false });

                if (['gerente', 'secretario'].includes(tipoUsuario)) {
                    try {
                        const res = await fetchUsuarios(fkEmpresaId, { id: pageId });
                        const usuario = res?.[0];
                        if (usuario && usuario.fk_empresa_id == fkEmpresaId) {
                            return setAccessState({ loading: false, granted: true, unauthenticated: false });
                        }
                    } catch (e) { }
                    return setAccessState({ loading: false, granted: false, unauthenticated: false });
                }

                return setAccessState({ loading: false, granted: false, unauthenticated: false });
            }

            // USUÁRIO
            if (pageType === 'usuario') {
                if (tipoUsuario === 'funcionario') return setAccessState({ loading: false, granted: false, unauthenticated: false });

                if (['gerente', 'secretario'].includes(tipoUsuario)) {
                    return setAccessState({
                        loading: false,
                        granted: true,
                        unauthenticated: false,
                    });
                }

                return setAccessState({ loading: false, granted: false, unauthenticated: false });
            }

            if (pageType === 'empresa') {
                if (tipoUsuario !== 'admin') return setAccessState({ loading: false, granted: false, unauthenticated: false });

                return setAccessState({
                    loading: false,
                    granted: pageId === fkEmpresaId,
                    unauthenticated: false,
                });
            }

            return setAccessState({ loading: false, granted: false, unauthenticated: false });
        };

        verificar();
    }, [authLoading, isAuthenticated, pageType, pageId, tipoUsuario, idUsuario, fkEmpresaId]);

    return {
        authLoading,
        accessLoading: authLoading || accessState.loading,
        granted: accessState.granted,
        unauthenticated: accessState.unauthenticated,
    };
};