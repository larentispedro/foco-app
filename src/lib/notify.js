export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

export function notifyCycleEnd(nextMode) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const title = nextMode === "break" ? "Hora da pausa" : "Hora de focar";
  const body =
    nextMode === "break"
      ? "Ciclo de foco concluído. Descanse um pouco."
      : "Pausa concluída. Bora focar.";
  try {
    new Notification(title, { body, icon: "/favicon.svg" });
  } catch {
    // navegador pode bloquear silenciosamente
  }
}
