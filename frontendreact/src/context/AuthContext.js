import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../services/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

    // Verifica a autenticação ao carregar a aplicação
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_URL}/check-auth`, {
                    credentials: 'include', // Inclui cookies na requisição
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated) {
                        setIsAuthenticated(true); // Usuário autenticado
                    } else {
                        setIsAuthenticated(false); // Usuário não autenticado
                    }
                } else {
                    setIsAuthenticated(false); // Erro na requisição
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                setIsAuthenticated(false); // Erro na requisição
            } finally {
                setIsLoading(false); // Finaliza o carregamento
            }
        };

        checkAuth(); // Executa a verificação ao carregar a aplicação
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);