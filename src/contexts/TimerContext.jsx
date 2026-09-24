import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useTimerEngine } from "../hooks/useTimerEngine";
import { useDocumentPip } from "../hooks/useDocumentPip";
import { usePomodoroSessions } from "../hooks/usePomodoroSessions";
import { playChime } from "../lib/sound";
import { notifyCycleEnd } from "../lib/notify";

const SETTINGS_KEY = "foco:timer-settings";
const TASK_KEY = "foco:timer-selected-task";

const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  breakMinutes: 5,
  soundEnabled: true,
  notifyEnabled: false,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  const [selectedTaskId, setSelectedTaskId] = useState(
    () => localStorage.getItem(TASK_KEY) || ""
  );

  const { logSession, sessions, reload: reloadSessions } = usePomodoroSessions();

  const engine = useTimerEngine({
    focusMinutes: settings.focusMinutes,
    breakMinutes: settings.breakMinutes,
    onFocusComplete: (durationSeconds) => {
      logSession({ taskId: selectedTaskId || null, durationSeconds });
    },
    onCycleComplete: (_finishedMode, nextMode) => {
      if (settings.soundEnabled) playChime();
      if (settings.notifyEnabled) notifyCycleEnd(nextMode);
    },
  });

  const pip = useDocumentPip();

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(TASK_KEY, selectedTaskId || "");
  }, [selectedTaskId]);

  const updateSettings = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const value = {
    ...engine,
    settings,
    updateSettings,
    selectedTaskId,
    setSelectedTaskId,
    pip,
    sessions,
    reloadSessions,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer precisa estar dentro de <TimerProvider>");
  return ctx;
}
