import { useState } from "react";
import KanbanColumn from "./KanbanColumn";

const COLUMNS = [
  { status: "todo", label: "A fazer" },
  { status: "doing", label: "Em andamento" },
  { status: "done", label: "Concluído" },
];

export default function KanbanBoard({ tasks, projectsById, onOpen, onMove }) {
  const [draggingId, setDraggingId] = useState(null);

  function handleDragStart(e, taskId) {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(status) {
    if (draggingId) onMove(draggingId, status);
    setDraggingId(null);
  }

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.status}
          status={col.status}
          label={col.label}
          tasks={tasks.filter((t) => t.status === col.status)}
          projectsById={projectsById}
          onOpen={onOpen}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          draggingId={draggingId}
        />
      ))}
    </div>
  );
}
