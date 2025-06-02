// src/App.js
import React from "react";
import { Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Login from "./components/Login/Login";
import Agenda from "./components/Agenda/Agenda";
import Empresa from "./components/Empresa/Empresa";
import Usuario from "./components/Usuario/Usuario";
import Horario from "./components/Horario/Horario";
import NotFound from "./components/NotFound/NotFound"; // Importe o novo componente
import VerifyToken from "./components/VerifyToken/VerifyToken";
import ProtectedAgendaRoute from "./services/ProtectedAgendaRoute";
import ProtectedUsuarioRoute from "./services/ProtectedUsuarioRoute";
import ProtectedEmpresaRoute from "./services/ProtectedEmpresaRoute";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import UpdatePassword from "./components/UpdatePassword/UpdatePassword";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ProtectedHorarioRoute from "./services/ProtectedHorarioRoute copy";
import ProtectedUpdatePasswordRoute from "./services/ProtectedUpdatePasswordRoute";
import AgendaHorario from "./components/AgendaHorario/AgendaHorario";

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
          <Route element={<ProtectedAgendaRoute />}>
            <Route path="/agendaHorario/:id" element={<AgendaHorario />} />
          </Route>
          <Route element={<ProtectedHorarioRoute />}>
            <Route path="/horario/:id" element={<Horario />} />
          </Route>
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
