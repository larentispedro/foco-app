import { useState } from "react";

const STATUS_LABELS = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluído",
};

// task === null => modo criação. task !== null => edição.
export default function TaskModal({ task, projects, defaultProjectId, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [projectId, setProjectId] = useState(
    task?.project_id ?? defaultProjectId ?? ""
  );
  const [status, setStatus] = useState(task?.status ?? "todo");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        project_id: projectId || null,
        status,
        due_date: dueDate || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{task ? "Editar tarefa" : "Nova tarefa"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Título</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Projeto</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Sem projeto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Prazo</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <div>
              {task && (
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDelete(task.id).then(onClose)}
                >
                  Excluir
                </button>
              )}
            </div>
            <div className="right">
              <button type="button" className="ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="primary" disabled={saving}>
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
