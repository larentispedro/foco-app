import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useProjects } from "../hooks/useProjects";

export default function Layout() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />
      <main className="main">
        <Outlet context={{ projects, selectedProjectId }} />
      </main>
    </div>
  );
}
