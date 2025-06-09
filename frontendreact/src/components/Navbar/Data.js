import React, { useEffect, useState } from "react";

function Data() {
  const [mesAtual, setMesAtual] = useState("");
  const [diaAtual, setDiaAtual] = useState("");
  const [diaSemanaAtual, setDiaSemanaAtual] = useState("");

  useEffect(() => {
    // Atualiza a data atual formatada
    const agora = new Date();
    const diaSemanaFormatada = agora.toLocaleDateString("pt-BR", {
      weekday: "short",
    });
    const diaFormatada = agora.toLocaleDateString("pt-BR", {
      day: "2-digit",
    });
    const mesFormatada = agora.toLocaleDateString("pt-BR", {
      month: "long",
    });
    setDiaSemanaAtual(diaSemanaFormatada);
    setDiaAtual(diaFormatada);
    setMesAtual(mesFormatada);
  }, []);

  return (
    <div>
      <div className="diaMes">
        {diaAtual}-{diaSemanaAtual} {mesAtual}
      </div>
    </div>
  );
}

export default Data;
