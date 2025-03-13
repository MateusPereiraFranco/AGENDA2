import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../services/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verifica a autenticação ao carregar a aplicação
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token'); // Recupera o token do localStorage
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/check-auth`, {
                        credentials: 'include', // Inclui cookies na requisição
                        headers: {
                            'Authorization': `Bearer ${token}`, // Envia o token no cabeçalho
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.authenticated) {
                            setIsAuthenticated(true);
                        } else {
                            setIsAuthenticated(false);
                        }
                    } else {
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error('Erro ao verificar autenticação:', error);
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);