import { useState } from "react";
import TaskCard from "./TaskCard";

export default function KanbanColumn({
  status,
  label,
  tasks,
  projectsById,
  onOpen,
  onDragStart,
  onDrop,
  draggingId,
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={`kanban-column${isOver ? " is-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(status);
      }}
    >
      <div className="kanban-column-header">
        <h3>{label}</h3>
        <span className="count mono">{tasks.length}</span>
      </div>
      <div className="kanban-cards">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            project={projectsById[task.project_id]}
            onOpen={onOpen}
            onDragStart={onDragStart}
            dragging={draggingId === task.id}
          />
        ))}
        {tasks.length === 0 && (
          <div className="empty-state" style={{ padding: "16px 0" }}>
            Nada aqui
          </div>
        )}
      </div>
    </div>
  );
}
