import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App";
import Providers from "./Providers";

const container = document.getElementById("root");
if (!container) throw new Error("No se encontró el elemento #root en index.html");

createRoot(container).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
