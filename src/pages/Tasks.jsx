import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import KanbanBoard from "../components/kanban/KanbanBoard";
import TaskModal from "../components/TaskModal";

export default function Tasks() {
  const { projects, selectedProjectId } = useOutletContext();
  const { tasks, createTask, updateTask, deleteTask } = useTasks(selectedProjectId);
  const [modalTask, setModalTask] = useState(undefined); // undefined = fechado, null = criar, obj = editar

  const projectsById = Object.fromEntries(projects.map((p) => [p.id, p]));

  function handleMove(taskId, status) {
    updateTask(taskId, { status });
  }

  async function handleSave(patch) {
    if (modalTask) {
      await updateTask(modalTask.id, patch);
    } else {
      await createTask({
        title: patch.title,
        projectId: patch.project_id,
        dueDate: patch.due_date,
      });
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tarefas</h1>
          <p className="subtitle">Arraste entre colunas ou clique para editar</p>
        </div>
        <div className="page-actions">
          <button className="primary" onClick={() => setModalTask(null)}>
            + Nova tarefa
          </button>
        </div>
      </div>

      <KanbanBoard
        tasks={tasks}
        projectsById={projectsById}
        onOpen={(task) => setModalTask(task)}
        onMove={handleMove}
      />

      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          projects={projects}
          defaultProjectId={selectedProjectId !== "all" ? selectedProjectId : ""}
          onClose={() => setModalTask(undefined)}
          onSave={handleSave}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
