import React, { useState } from "react";
import { API_URL } from "../../services/apiConfig";
import SenhaInput from "../../components/SenhaInput"; // Mesmo componente usado no Reset

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const senhasCoincidem =
    newPassword === confirmPassword && newPassword.length > 0;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!senhasCoincidem) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setSucesso("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErro(err.message || "Erro ao atualizar senha");
    }
  };

  return (
    <div className="trocaSenha_conteiner_geral">
      <form className="form_trocaSenha" onSubmit={handleUpdate}>
        <h2>Atualizar Senha</h2>

        <div className="input-container">
          <SenhaInput
            name="Senha atual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder=""
            required
            id="senhaAtual"
          />
        </div>
        <div className="input-container">
          <SenhaInput
            name="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder=""
            required
            id="novaSenha"
          />
        </div>
        <div className="input-container">
          <SenhaInput
            name="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder=""
            required
            id="confirmaSenha"
          />
        </div>
        {confirmPassword && (
          <p style={{ color: senhasCoincidem ? "green" : "red" }}>
            {senhasCoincidem
              ? "✔ Senhas coincidem"
              : "✖ As senhas não coincidem"}
          </p>
        )}

        <button
          id="botaoAtuSen"
          className="botao_verde"
          type="submit"
          disabled={!senhasCoincidem}
        >
          Atualizar
        </button>

        {sucesso && <p style={{ color: "green" }}>{sucesso}</p>}
        {erro && <p style={{ color: "red" }}>{erro}</p>}
      </form>
    </div>
  );
};

export default UpdatePassword;
