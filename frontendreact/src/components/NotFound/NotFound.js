// src/components/NotFound/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className='quatroZeroQuatro_conteiner'>
            <h1 className='quatroZeroQuatro'>404</h1> 
            <h2>Página Não Encontrada</h2>
            <p>A página que você está tentando acessar não existe.</p>
            <Link to="/login">Voltar para a página inicial</Link>
        </div>
    );
};

export default NotFound; // Exportação padrão