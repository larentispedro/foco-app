function isOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate + "T00:00:00") < today;
}

function formatDate(dueDate) {
  const [, m, d] = dueDate.split("-");
  return `${d}/${m}`;
}

export default function TaskCard({ task, project, onOpen, onDragStart, dragging }) {
  return (
    <div
      className={`task-card${dragging ? " dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpen(task)}
    >
      <div className="task-title">{task.title}</div>
      <div className="task-meta">
        {project && (
          <span className="tag" style={{ borderColor: project.color, color: project.color }}>
            {project.name}
          </span>
        )}
        {task.due_date && (
          <span
            className={`tag due${isOverdue(task.due_date, task.status) ? " overdue" : ""}`}
          >
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
