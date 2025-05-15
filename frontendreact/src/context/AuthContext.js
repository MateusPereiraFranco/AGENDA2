import { API_URL } from '../services/apiConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkAuth as checkAuthService } from '../services/authService';
import { saveUserToSession, getUserFromSession, clearUserFromSession } from '../services/authStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!getUserFromSession());
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const { authenticated, user } = await checkAuthService();
            if (authenticated) {
                setIsAuthenticated(true);
                setUser(user);
                saveUserToSession(user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
                clearUserFromSession();
            }
        } catch (err) {
            console.error('Erro ao verificar auth:', err);
            setIsAuthenticated(false);
            setUser(null);
            clearUserFromSession();
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            clearUserFromSession();
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated, // só se realmente necessário
                user,
                setUser, // idem
                isLoading,
                checkAuth, // exposto para uso em qualquer lugar
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);