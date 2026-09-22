import { useOutletContext } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";

function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function groupLabel(dueDate, today) {
  const d = startOfDay(new Date(dueDate + "T00:00:00"));
  const diffDays = Math.round((d - today) / 86400000);
  if (diffDays < 0) return "Atrasadas";
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function Agenda() {
  const { selectedProjectId } = useOutletContext();
  const { tasks } = useTasks(selectedProjectId);

  const withDueDate = tasks
    .filter((t) => t.due_date)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const today = startOfDay(new Date());
  const groups = [];
  for (const task of withDueDate) {
    const label = groupLabel(task.due_date, today);
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, tasks: [] };
      groups.push(group);
    }
    group.tasks.push(task);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Agenda</h1>
          <p className="subtitle">Tarefas com prazo, em ordem</p>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="empty-state">Nenhuma tarefa com prazo definido</div>
      )}

      {groups.map((group) => (
        <div className="agenda-group" key={group.label}>
          <div className="agenda-group-label">
            {group.label.toUpperCase()}
          </div>
          {group.tasks.map((task) => (
            <div className="agenda-row" key={task.id}>
              <div className="agenda-title">{task.title}</div>
              <div className="agenda-meta">
                <span className={`status-dot ${task.status}`} />
                <span className="text-faint mono" style={{ fontSize: 12 }}>
                  {task.status === "done" ? "concluída" : task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
