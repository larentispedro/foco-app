import { useTimer } from "../contexts/TimerContext";
import { useTasks } from "../hooks/useTasks";

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

function last7DayKeys() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function Reports() {
  const { sessions } = useTimer();
  const { tasks } = useTasks(null);

  const todayKey = dateKey(new Date());
  const minutesByDay = {};
  let minutesToday = 0;
  let sessionsToday = 0;

  for (const s of sessions) {
    const key = s.completed_at.slice(0, 10);
    const minutes = s.duration_seconds / 60;
    minutesByDay[key] = (minutesByDay[key] || 0) + minutes;
    if (key === todayKey) {
      minutesToday += minutes;
      sessionsToday += 1;
    }
  }

  const days = last7DayKeys();
  const maxMinutes = Math.max(1, ...days.map((d) => minutesByDay[dateKey(d)] || 0));

  const doneTasks = tasks.filter((t) => t.status === "done").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Relatórios</h1>
          <p className="subtitle">Baseado no histórico de sessões de foco</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value mono">{Math.round(minutesToday)}min</div>
          <div className="stat-label">Foco hoje</div>
        </div>
        <div className="stat-card">
          <div className="stat-value mono">{sessionsToday}</div>
          <div className="stat-label">Ciclos hoje</div>
        </div>
        <div className="stat-card">
          <div className="stat-value mono">
            {Math.round(days.reduce((sum, d) => sum + (minutesByDay[dateKey(d)] || 0), 0))}min
          </div>
          <div className="stat-label">Foco nos últimos 7 dias</div>
        </div>
        <div className="stat-card">
          <div className="stat-value mono">{doneTasks}</div>
          <div className="stat-label">Tarefas concluídas (total)</div>
        </div>
      </div>

      <div className="panel">
        <h2>Minutos de foco por dia</h2>
        <div className="bar-chart">
          {days.map((d) => {
            const key = dateKey(d);
            const minutes = minutesByDay[key] || 0;
            const heightPct = Math.max(2, (minutes / maxMinutes) * 100);
            return (
              <div className="bar-chart-col" key={key}>
                <div
                  className="bar-chart-bar"
                  style={{ height: `${heightPct}%` }}
                  title={`${Math.round(minutes)} min`}
                />
                <div className="bar-chart-label">
                  {d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
