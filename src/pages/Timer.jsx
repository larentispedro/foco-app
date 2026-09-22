import { createPortal } from "react-dom";
import { useTimer } from "../contexts/TimerContext";
import { useTasks } from "../hooks/useTasks";
import { formatTime } from "../hooks/useTimerEngine";
import PipContent from "../components/timer/PipContent";

const RADIUS = 124;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Timer() {
  const {
    mode,
    isRunning,
    secondsLeft,
    progress,
    start,
    pause,
    reset,
    selectedTaskId,
    setSelectedTaskId,
    pip,
  } = useTimer();

  const { tasks } = useTasks(null);
  const openTasks = tasks.filter((t) => t.status !== "done");

  const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className="timer-page">
      <div className="page-header" style={{ width: "100%", maxWidth: 420 }}>
        <div>
          <h1>Timer</h1>
          <p className="subtitle">Ciclos de foco vinculados a uma tarefa</p>
        </div>
      </div>

      <div className="timer-task-select">
        <label className="text-muted" style={{ fontSize: 12 }}>
          Tarefa vinculada a este ciclo
        </label>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
        >
          <option value="">Sem tarefa (foco livre)</option>
          {openTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      <div className="timer-ring-wrap">
        <svg viewBox="0 0 280 280">
          <circle className="timer-ring-bg" cx="140" cy="140" r={RADIUS} />
          <circle
            className={`timer-ring-progress ${mode === "break" ? "break" : ""}`}
            cx="140"
            cy="140"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="timer-center">
          <div className="timer-display">{formatTime(secondsLeft)}</div>
          <div className="timer-mode">
            {mode === "focus" ? "Foco" : "Pausa"}
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {isRunning ? (
          <button onClick={pause}>Pausar</button>
        ) : (
          <button className="primary" onClick={start}>
            Iniciar
          </button>
        )}
        <button className="ghost" onClick={reset}>
          Reiniciar
        </button>
      </div>

      <div className="pip-row">
        {pip.supported ? (
          pip.pipWindow ? (
            <button onClick={pip.close}>Fechar mini janela</button>
          ) : (
            <button onClick={pip.open}>Abrir em mini janela (PiP)</button>
          )
        ) : (
          <p className="pip-note">
            Picture-in-picture funciona no Chrome/Edge. Neste navegador o
            botão fica desativado, mas o timer continua rodando normalmente
            aqui na aba.
          </p>
        )}
      </div>
      {pip.supported && (
        <p className="pip-note">
          A mini janela some se você fechar esta aba — ela depende da aba
          principal continuar aberta (pode estar em segundo plano).
        </p>
      )}

      {pip.pipWindow &&
        createPortal(
          <PipContent
            mode={mode}
            secondsLeft={secondsLeft}
            isRunning={isRunning}
            start={start}
            pause={pause}
          />,
          pip.pipWindow.document.body
        )}
    </div>
  );
}
