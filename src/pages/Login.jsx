import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleGoogle() {
    setError("");
    setInfo("");
    const { error: err } = await signInWithGoogle();
    if (err) setError(err.message || "Algo deu errado.");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
      } else {
        const { error: err } = await signUp(email, password);
        if (err) throw err;
        setInfo(
          "Conta criada. Se a confirmação por e-mail estiver ativada no seu projeto Supabase, confirme antes de entrar."
        );
      }
    } catch (err) {
      setError(err.message || "Algo deu errado.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Foco</h1>
        <p className="subtitle">
          {mode === "signin" ? "Entre na sua conta" : "Crie sua conta"}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {info && (
          <div className="auth-error" style={{ background: "var(--done-dim)", color: "var(--done)" }}>
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "…" : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button type="button" className="auth-google" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.616Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.4 5.4 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A9 9 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58Z"/>
          </svg>
          Continuar com Google
        </button>

        <div className="auth-switch">
          {mode === "signin" ? (
            <>
              Não tem conta?{" "}
              <button onClick={() => setMode("signup")}>Criar uma</button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button onClick={() => setMode("signin")}>Entrar</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
