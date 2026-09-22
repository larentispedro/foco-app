import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTimer } from "../contexts/TimerContext";
import { formatTime } from "../hooks/useTimerEngine";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/tarefas", label: "Tarefas" },
  { to: "/timer", label: "Timer" },
  { to: "/agenda", label: "Agenda" },
  { to: "/relatorios", label: "Relatórios" },
  { to: "/projetos", label: "Projetos" },
  { to: "/config", label: "Configurações" },
];

export default function Sidebar({ projects, selectedProjectId, onSelectProject }) {
  const { user, signOut } = useAuth();
  const { mode, secondsLeft, isRunning, start, pause } = useTimer();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-mark">●</span> Foco
        </div>
      </div>

      <div className="project-switcher">
        <select
          value={selectedProjectId}
          onChange={(e) => onSelectProject(e.target.value)}
        >
          <option value="all">Todos os projetos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="mini-timer">
          <div className="mini-timer-label">
            {mode === "focus" ? "Foco" : "Pausa"}
          </div>
          <div className="mini-timer-time">{formatTime(secondsLeft)}</div>
          <div className="mini-timer-row">
            {isRunning ? (
              <button onClick={pause}>Pausar</button>
            ) : (
              <button className="primary" onClick={start}>
                Iniciar
              </button>
            )}
          </div>
        </div>
        <div className="sidebar-user" title={user?.email}>
          {user?.email}
        </div>
        <button className="ghost" onClick={signOut}>
          Sair
        </button>
      </div>
    </aside>
  );
}
