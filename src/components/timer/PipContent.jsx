import { formatTime } from "../../hooks/useTimerEngine";

export default function PipContent({ mode, secondsLeft, isRunning, start, pause }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 40,
          fontWeight: 500,
          color: mode === "focus" ? "var(--accent)" : "var(--done)",
        }}
      >
        {formatTime(secondsLeft)}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        {mode === "focus" ? "Foco" : "Pausa"}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {isRunning ? (
          <button onClick={pause}>Pausar</button>
        ) : (
          <button className="primary" onClick={start}>
            Iniciar
          </button>
        )}
      </div>
    </div>
  );
}
