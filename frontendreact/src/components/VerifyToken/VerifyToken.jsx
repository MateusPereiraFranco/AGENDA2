import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../services/apiConfig";

function VerifyToken() {
  const [token, setToken] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tempoRestante, setTempoRestante] = useState(0);
  const [reenviando, setReenviando] = useState(false);

  const navigate = useNavigate();
  const email = localStorage.getItem("recovery_email");
  const expiresAt = parseInt(localStorage.getItem("recovery_expires"), 10); // 🧠 agora usa o valor real

  useEffect(() => {
    if (!email || !expiresAt) {
      navigate("/forgot-password");
    }

    const updateTimer = () => {
      const diff = Math.floor((expiresAt - Date.now()) / 1000);
      setTempoRestante(Math.max(diff, 0));
    };

    updateTimer(); // inicial
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [email, expiresAt, navigate]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    try {
      const response = await fetch(`${API_URL}/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("recovery_token", token);
      navigate("/reset-password");
    } catch (err) {
      setErro(err.message || "Erro ao verificar código");
    }
  };

  const handleReenviarCodigo = async () => {
    setErro("");
    setMensagem("");
    setReenviando(true);

    try {
      const response = await fetch(`${API_URL}/reset-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const novoExpira = Date.now() + 10 * 60 * 1000;
      localStorage.setItem("recovery_expires", novoExpira);

      setMensagem("Novo código enviado para seu email.");
    } catch (err) {
      setErro(err.message || "Erro ao reenviar código");
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="vt_conteiner">
      <h2>Verificar Código</h2>

      {tempoRestante > 0 ? (
        <p>
          Tempo restante: <strong>{formatTime(tempoRestante)}</strong>
        </p>
      ) : (
        <>
          <p style={{ color: "orange" }}>
            Tempo expirado. Solicite um novo código.
          </p>
          <button
            className="botao_verde"
            onClick={handleReenviarCodigo}
            disabled={reenviando}
          >
            {reenviando ? "Reenviando..." : "Reenviar código"}
          </button>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Código recebido"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <button
          id="botaoAtuSen"
          className="botao_verde"
          type="submit"
          disabled={tempoRestante <= 0}
        >
          Verificar
        </button>
      </form>

      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}

export default VerifyToken;
