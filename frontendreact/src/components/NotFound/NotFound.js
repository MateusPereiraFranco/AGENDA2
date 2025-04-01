// src/components/NotFound/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>404 - Página Não Encontrada</h1>
            <p>A página que você está tentando acessar não existe.</p>
            <Link to="/login">Voltar para a página inicial</Link>
        </div>
    );
};

export default NotFound; // Exportação padrão