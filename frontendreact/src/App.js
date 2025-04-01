// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Empresa from './components/Empresa/Empresa';
import Usuario from './components/Usuario/Usuario';
import Agenda from './components/Agenda/Agenda';
import Horario from './components/Horario/Horario';
import Navbar from './components/Navbar/Navbar';
import NotFound from './components/NotFound/NotFound' // Importe o novo componente
import { AuthProvider } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProtectedUsuarioRoute from './services/ProtectedUsuarioRoute';
import ProtectedAgendaRoute from './services/ProtectedAgendaRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    {/* Rota pública (não protegida) */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />

                    {/* Rotas protegidas */}
                    <Route element={<ProtectedUsuarioRoute />}>
                        <Route path="/empresa" element={<Empresa />} />
                        <Route path="/usuario/:id" element={<Usuario />} />
                    </Route>

                    <Route element={<ProtectedAgendaRoute />}>
                        <Route path="/agenda/:id" element={<Agenda />} />
                    </Route>
                    <Route path="/horario/:id" element={<Horario />} />

                    {/* Rota 404 - deve ser a última */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;