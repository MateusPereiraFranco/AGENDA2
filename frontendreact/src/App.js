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
import ProtectedEmpresaRoute from './services/ProtectedEmpresaRoute';
import ProtectedUpdatePasswordRoute from './services/ProtectedUpdatePasswordRoute';
import UpdatePassword from './components/UpdatePassword/UpdatePassword';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import VerifyToken from './components/VerifyToken/VerifyToken';
import ResetPassword from './components/ResetPassword/ResetPassword';


function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    {/* Rota pública (não protegida) */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />

                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-token" element={<VerifyToken />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Rotas protegidas */}
                    <Route element={<ProtectedEmpresaRoute />}>
                        <Route path="/empresa" element={<Empresa />} />
                    </Route>
                    <Route element={<ProtectedUsuarioRoute />}>
                        <Route path="/usuario/:id" element={<Usuario />} />
                    </Route>

                    <Route element={<ProtectedAgendaRoute />}>
                        <Route path="/agenda/:id" element={<Agenda />} />
                    </Route>
                    <Route path="/horario/:id" element={<Horario />} />

                    <Route element={<ProtectedUpdatePasswordRoute />}>
                        <Route path="/atualizar-senha" element={<UpdatePassword />} />
                    </Route>
                    {/* Rota 404 - deve ser a última */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;