import { useState } from "react";
import { useProjects } from "../hooks/useProjects";

export default function Projects() {
  const { projects, createProject, deleteProject } = useProjects();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e8a23d");

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject(name.trim(), color);
    setName("");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projetos</h1>
          <p className="subtitle">Agrupe tarefas por projeto</p>
        </div>
      </div>

      <div className="panel">
        {projects.length === 0 && (
          <div className="empty-state">Nenhum projeto ainda</div>
        )}
        <div className="project-list">
          {projects.map((p) => (
            <div className="project-row" key={p.id}>
              <div className="project-row-name">
                <span className="color-dot" style={{ background: p.color }} />
                {p.name}
              </div>
              <button className="danger ghost" onClick={() => deleteProject(p.id)}>
                Excluir
              </button>
            </div>
          ))}
        </div>

        <form className="new-project-row" onSubmit={handleAdd}>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: 40, padding: 2 }}
          />
          <input
            type="text"
            placeholder="Nome do projeto"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="primary">
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
