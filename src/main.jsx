import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/app.css";
import App from "./App.jsx";
import { supabase } from "./lib/supabaseClient";

function render() {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// O HashRouter usa a URL depois do "#" pra decidir a rota, e o Supabase usa
// esse mesmo lugar pra devolver o token de login (confirmação de e-mail,
// callback do Google). Se montarmos o router antes do supabase-js consumir
// o token, ele tenta casar "/access_token=..." como rota e mostra tela em
// branco. Por isso: se o hash parecer um retorno de auth, esperamos o
// supabase-js processar (o que limpa a URL) antes de montar o app.
const hash = window.location.hash.slice(1);
if (/(^|&)(access_token|error|error_description)=/.test(hash)) {
  supabase.auth.getSession().finally(() => {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search + "#/"
    );
    render();
  });
} else {
  render();
}
