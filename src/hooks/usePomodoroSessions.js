import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

// Busca as sessões dos últimos `days` dias (default 14) para relatórios/dashboard.
export function usePomodoroSessions(days = 14) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .gte("completed_at", since.toISOString())
      .order("completed_at", { ascending: false });

    if (!error) setSessions(data);
    setLoading(false);
  }, [user, days]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function logSession({ taskId, durationSeconds }) {
    const { error } = await supabase.from("pomodoro_sessions").insert({
      task_id: taskId || null,
      duration_seconds: durationSeconds,
      user_id: user.id,
    });
    if (error) throw error;
    await reload();
  }

  return { sessions, loading, logSession, reload };
}
