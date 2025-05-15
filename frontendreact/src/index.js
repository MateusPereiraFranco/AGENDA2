import React from "react";
import { createRoot } from "react-dom/client"; // Importa createRoot
import App from "./App";
import "./styles/normalize.css";
import "./styles/global.css";

// Seleciona o elemento raiz do aplicativo
const container = document.getElementById("root");

// Cria uma raiz para o aplicativo
const root = createRoot(container);

// Renderiza o aplicativo
root.render(
  <React.StrictMode>
    <div class="stars"></div>
    <div class="shooting-star"></div>
    <div class="shooting-star"></div>
    <div class="shooting-star"></div>
    <div class="shooting-star"></div>
    <div class="shooting-star"></div>
    <App />
  </React.StrictMode>
);
