import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

// projectId: null = todas as tarefas do usuário; "unassigned" ou um id filtra.
export function useTasks(projectId) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectId && projectId !== "all") {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;
    if (!error) setTasks(data);
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createTask({ title, projectId: pid, dueDate }) {
    const { error } = await supabase.from("tasks").insert({
      title,
      project_id: pid || null,
      due_date: dueDate || null,
      user_id: user.id,
    });
    if (error) throw error;
    await reload();
  }

  async function updateTask(id, patch) {
    const { error } = await supabase
      .from("tasks")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    await reload();
  }

  async function deleteTask(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    await reload();
  }

  return { tasks, loading, createTask, updateTask, deleteTask, reload };
}
