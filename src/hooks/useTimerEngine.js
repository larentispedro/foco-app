import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "foco:timer-engine-state";

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePersisted(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponível (aba privada, quota cheia etc.) — segue sem persistir
  }
}

/**
 * Motor do timer. Duas decisões deliberadas aqui:
 *
 * 1. O tempo restante nunca é decrementado por contagem de tick. Guardamos
 *    o timestamp alvo (endAt) e todo tick recalcula por diferença contra
 *    Date.now(). Isso importa porque o navegador reduz a frequência de
 *    timers em abas em segundo plano — contar ticks faria o pomodoro
 *    "atrasar" depois de um tempo com a aba minimizada.
 *
 * 2. O estado é persistido no localStorage a cada mudança relevante, e
 *    reidratado (recalculando o restante contra o relógio atual) ao montar.
 *    Sem isso, um F5 no meio de um ciclo zera o progresso.
 */
export function useTimerEngine({ focusMinutes, breakMinutes, onFocusComplete }) {
  const initial = useRef(loadPersisted());

  const [mode, setMode] = useState(initial.current?.mode ?? "focus");
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    initial.current?.mode === "break"
      ? breakMinutes * 60
      : focusMinutes * 60
  );

  const endAtRef = useRef(null);
  const timeoutRef = useRef(null);
  const onFocusCompleteRef = useRef(onFocusComplete);
  onFocusCompleteRef.current = onFocusComplete;

  const durationFor = useCallback(
    (m) => (m === "focus" ? focusMinutes : breakMinutes) * 60,
    [focusMinutes, breakMinutes]
  );

  // Reidrata uma vez, na montagem: se havia um endAt salvo e ainda não
  // passou, retoma rodando; se já passou (app ficou fechado além do fim
  // do ciclo), só mostra 0 parado — não dispara log retroativo.
  useEffect(() => {
    const p = initial.current;
    if (!p) return;
    if (p.endAt) {
      const remainingMs = p.endAt - Date.now();
      if (remainingMs > 0) {
        endAtRef.current = p.endAt;
        setSecondsLeft(Math.ceil(remainingMs / 1000));
        setIsRunning(true);
      } else {
        setSecondsLeft(0);
        setIsRunning(false);
      }
    } else if (typeof p.secondsLeft === "number") {
      setSecondsLeft(p.secondsLeft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    savePersisted({
      mode,
      secondsLeft,
      endAt: isRunning ? endAtRef.current : null,
    });
  }, [mode, secondsLeft, isRunning]);

  const tick = useCallback(() => {
    if (!endAtRef.current) return;
    const remainingMs = endAtRef.current - Date.now();
    const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
    setSecondsLeft(remaining);

    if (remaining <= 0) {
      endAtRef.current = null;
      setIsRunning(false);
      const finishedMode = mode;
      const nextMode = finishedMode === "focus" ? "break" : "focus";
      if (finishedMode === "focus") {
        onFocusCompleteRef.current?.(durationFor("focus"));
      }
      setMode(nextMode);
      setSecondsLeft(durationFor(nextMode));
      return;
    }
    timeoutRef.current = window.setTimeout(tick, 250);
  }, [mode, durationFor]);

  useEffect(() => {
    if (isRunning) {
      timeoutRef.current = window.setTimeout(tick, 250);
    }
    return () => window.clearTimeout(timeoutRef.current);
  }, [isRunning, tick]);

  const start = useCallback(() => {
    if (secondsLeft <= 0) return;
    endAtRef.current = Date.now() + secondsLeft * 1000;
    setIsRunning(true);
  }, [secondsLeft]);

  const pause = useCallback(() => {
    if (endAtRef.current) {
      const remainingMs = endAtRef.current - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
    }
    endAtRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    endAtRef.current = null;
    setIsRunning(false);
    setSecondsLeft(durationFor(mode));
  }, [mode, durationFor]);

  const switchMode = useCallback(
    (nextMode) => {
      endAtRef.current = null;
      setIsRunning(false);
      setMode(nextMode);
      setSecondsLeft(durationFor(nextMode));
    },
    [durationFor]
  );

  const total = durationFor(mode);
  const progress = total > 0 ? 1 - secondsLeft / total : 0;

  return {
    mode,
    isRunning,
    secondsLeft,
    total,
    progress,
    start,
    pause,
    reset,
    switchMode,
  };
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
