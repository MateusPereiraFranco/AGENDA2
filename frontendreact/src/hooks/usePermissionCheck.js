// src/hooks/usePermissionCheck.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUsuarios } from '../services/usuarioService';

export const usePermissionCheck = ({ pageType, pageId }) => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [accessState, setAccessState] = useState({
        loading: true,
        granted: false,
        unauthenticated: false,
    });

    useEffect(() => {
        const verificar = async () => {
            if (authLoading || !user) return; // ✅ Aguarda o usuário ser carregado

            const { tipo_usuario, id_usuario, fk_empresa_id } = user;
            console.log('user', user);

            if (!isAuthenticated) {
                return setAccessState({
                    loading: false,
                    granted: false,
                    unauthenticated: true,
                });
            }

            if (tipo_usuario === 'admin') {
                return setAccessState({ loading: false, granted: true, unauthenticated: false });
            }

            if (pageType === 'atualizar-senha') {
                return setAccessState({ loading: false, granted: true, unauthenticated: false });
            }

            if (pageType === 'agenda') {
                if (id_usuario.toString() === pageId.toString()) {
                    return setAccessState({ loading: false, granted: true, unauthenticated: false });
                }

                if (['gerente', 'secretario'].includes(tipo_usuario)) {
                    try {
                        const res = await fetchUsuarios(fk_empresa_id, { id: pageId });
                        const usuario = res?.[0];
                        if (usuario && usuario.fk_empresa_id == fk_empresa_id) {
                            return setAccessState({ loading: false, granted: true, unauthenticated: false });
                        }
                    } catch (e) { }
                    return setAccessState({ loading: false, granted: false, unauthenticated: false });
                }

                return setAccessState({ loading: false, granted: false, unauthenticated: false });
            }

            if (pageType === 'usuario') {

                if (tipo_usuario === 'funcionario') {

                    return setAccessState({ loading: false, granted: false, unauthenticated: false });
                }

                if (['gerente', 'secretario'].includes(tipo_usuario)) {
                    if (fk_empresa_id.toString() === pageId.toString()) {
                        return setAccessState({
                            loading: false,
                            granted: true,
                            unauthenticated: false,
                        });
                    }
                }

                return setAccessState({ loading: false, granted: false, unauthenticated: false });
            }

            if (pageType === 'empresa') {
                if (tipo_usuario !== 'admin') {
                    return setAccessState({ loading: false, granted: false, unauthenticated: false });
                }

                return setAccessState({
                    loading: false,
                    granted: pageId === fk_empresa_id,
                    unauthenticated: false,
                });
            }

            if (pageType === 'horario') {

                return setAccessState({
                    loading: false,
                    granted: pageId === fk_empresa_id,
                    unauthenticated: false,
                });
            }


            return setAccessState({ loading: false, granted: false, unauthenticated: false });
        };

        verificar();
    }, [authLoading, isAuthenticated, user, pageType, pageId]);

    return {
        authLoading,
        accessLoading: authLoading || accessState.loading,
        granted: accessState.granted,
        unauthenticated: accessState.unauthenticated,
    };
};
