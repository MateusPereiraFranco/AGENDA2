import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Empresa from './components/Empresa/Empresa';
import Usuario from './components/Usuario/Usuario';
import Agenda from './components/Agenda/Agenda';
import Horario from './components/Horario/Horario';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/empresa" element={<Empresa />} />
                <Route path="/usuario/:id" element={<Usuario />} />
                <Route path="/agenda/:id" element={<Agenda />} />
                <Route path="/horario/:id" element={<Horario />} />
            </Routes>
        </Router>
    );
}

export default App;