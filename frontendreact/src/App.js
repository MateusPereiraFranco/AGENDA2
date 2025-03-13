import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Empresa from './components/Empresa/Empresa';
import Usuario from './components/Usuario/Usuario';
import Agenda from './components/Agenda/Agenda';
import Horario from './components/Horario/Horario';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './services/ProtectedRoute'; // Importe o componente de rota protegida
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    {/* Rota pública (não protegida) */}
                    <Route path="/login" element={<Login />} />

                    {/* Rotas protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/empresa" element={<Empresa />} />
                        <Route path="/usuario/:id" element={<Usuario />} />
                        <Route path="/agenda/:id" element={<Agenda />} />
                        <Route path="/horario/:id" element={<Horario />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;