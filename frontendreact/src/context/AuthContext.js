import React, { createContext, useState, useContext } from 'react';

// Cria o contexto de autenticação
const AuthContext = createContext();

// Cria o provedor de autenticação
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);