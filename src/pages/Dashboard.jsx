import { Link } from "react-router-dom";
import { useTimer } from "../contexts/TimerContext";
import { useTasks } from "../hooks/useTasks";

export default function Dashboard() {
  const { sessions } = useTimer();
  const { tasks } = useTasks(null);

  const todayKey = new Date().toISOString().slice(0, 10);
  const minutesToday = sessions
    .filter((s) => s.completed_at.slice(0, 10) === todayKey)
    .reduce((sum, s) => sum + s.duration_seconds / 60, 0);

  const openTasks = tasks.filter((t) => t.status !== "done");
  const overdue = openTasks.filter(
    (t) => t.due_date && t.due_date < todayKey
  );
  const dueToday = openTasks.filter((t) => t.due_date === todayKey);

  const upcoming = openTasks
    .filter((t) => t.due_date)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 6);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Resumo do que está em aberto</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value mono">{Math.round(minutesToday)}min</div>
          <div className="stat-label">Foco hoje</div>
        </div>
        <div className="stat-card">
          <div className="stat-value mono">{openTasks.length}</div>
          <div className="stat-label">Tarefas em aberto</div>
        </div>
        <div className="stat-card">
          <div className="stat-value mono" style={{ color: overdue.length ? "var(--danger)" : undefined }}>
            {overdue.length}
          </div>
          <div className="stat-label">Atrasadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value mono">{dueToday.length}</div>
          <div className="stat-label">Vencem hoje</div>
        </div>
      </div>

      <div className="panel">
        <h2>Próximas na agenda</h2>
        {upcoming.length === 0 ? (
          <div className="empty-state">Nada com prazo definido</div>
        ) : (
          upcoming.map((t) => (
            <div className="agenda-row" key={t.id}>
              <div className="agenda-title">{t.title}</div>
              <div className="agenda-meta">
                <span className={`status-dot ${t.status}`} />
                <span className="text-faint mono" style={{ fontSize: 12 }}>
                  {t.due_date.split("-").reverse().join("/")}
                </span>
              </div>
            </div>
          ))
        )}
        <div style={{ marginTop: 14 }}>
          <Link to="/agenda">
            <button className="ghost">Ver agenda completa</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
