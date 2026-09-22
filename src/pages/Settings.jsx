import { useState } from "react";
import { useTimer } from "../contexts/TimerContext";
import { useAuth } from "../contexts/AuthContext";

export default function Settings() {
  const { settings, updateSettings, isRunning } = useTimer();
  const { user, signOut } = useAuth();
  const [focusMinutes, setFocusMinutes] = useState(settings.focusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(settings.breakMinutes);
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    updateSettings({
      focusMinutes: Number(focusMinutes) || 25,
      breakMinutes: Number(breakMinutes) || 5,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Configurações</h1>
          <p className="subtitle">Duração dos ciclos e conta</p>
        </div>
      </div>

      <div className="panel">
        <h2>Duração do ciclo</h2>
        {isRunning && (
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Um ciclo está rodando agora — a mudança vale a partir do próximo.
          </p>
        )}
        <form onSubmit={handleSave}>
          <div className="modal-field" style={{ maxWidth: 200 }}>
            <label>Foco (minutos)</label>
            <input
              type="number"
              min="1"
              max="180"
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(e.target.value)}
            />
          </div>
          <div className="modal-field" style={{ maxWidth: 200 }}>
            <label>Pausa (minutos)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
            />
          </div>
          <button type="submit" className="primary">
            {saved ? "Salvo" : "Salvar"}
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Conta</h2>
        <p className="text-muted" style={{ marginBottom: 14 }}>{user?.email}</p>
        <button className="danger ghost" onClick={signOut}>
          Sair
        </button>
      </div>
    </div>
  );
}
