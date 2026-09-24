import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar";

const EVENTS_RANGE_DAYS = 30;

function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function eventDateKey(event) {
  if (event.start?.date) return event.start.date;
  if (event.start?.dateTime) return toDateKey(new Date(event.start.dateTime));
  return null;
}

function eventTimeLabel(event) {
  if (!event.start?.dateTime) return "Dia inteiro";
  return new Date(event.start.dateTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupLabel(dateKey, today) {
  const d = startOfDay(new Date(dateKey + "T00:00:00"));
  const diffDays = Math.round((d - today) / 86400000);
  if (diffDays < 0) return "Atrasadas";
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function Agenda() {
  const { selectedProjectId } = useOutletContext();
  const { tasks } = useTasks(selectedProjectId);
  const google = useGoogleCalendar();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    if (!google.connected) {
      setEvents([]);
      return;
    }
    const today = startOfDay(new Date());
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + EVENTS_RANGE_DAYS);

    setEventsLoading(true);
    setEventsError("");
    google
      .fetchEvents({ timeMin: today.toISOString(), timeMax: rangeEnd.toISOString() })
      .then(setEvents)
      .catch((err) => setEventsError(err.message || "Falha ao buscar eventos."))
      .finally(() => setEventsLoading(false));
  }, [google.connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const withDueDate = tasks
    .filter((t) => t.due_date)
    .map((t) => ({ type: "task", dateKey: t.due_date, task: t }));

  const withEventDate = events
    .map((e) => ({ type: "event", dateKey: eventDateKey(e), event: e }))
    .filter((e) => e.dateKey);

  const entries = [...withDueDate, ...withEventDate].sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey)
  );

  const today = startOfDay(new Date());
  const groups = [];
  for (const entry of entries) {
    const label = groupLabel(entry.dateKey, today);
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Agenda</h1>
          <p className="subtitle">Tarefas com prazo e eventos do Google Agenda</p>
        </div>
        <div>
          {google.connected ? (
            <button className="ghost" onClick={google.disconnect}>
              Desconectar Google Agenda
            </button>
          ) : (
            <button className="primary" onClick={google.connect} disabled={google.connecting}>
              {google.connecting ? "Conectando…" : "Conectar Google Agenda"}
            </button>
          )}
        </div>
      </div>

      {google.error && <div className="auth-error">{google.error}</div>}
      {eventsError && <div className="auth-error">{eventsError}</div>}
      {google.connected && eventsLoading && (
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Buscando eventos…
        </p>
      )}
      {google.connected && !eventsLoading && (
        <p className="text-faint" style={{ fontSize: 12, marginBottom: 14 }}>
          Mostrando eventos dos próximos {EVENTS_RANGE_DAYS} dias.
        </p>
      )}

      {groups.length === 0 && (
        <div className="empty-state">Nenhuma tarefa com prazo ou evento no período</div>
      )}

      {groups.map((group) => (
        <div className="agenda-group" key={group.label}>
          <div className="agenda-group-label">{group.label.toUpperCase()}</div>
          {group.entries.map((entry) =>
            entry.type === "task" ? (
              <div className="agenda-row" key={`task-${entry.task.id}`}>
                <div className="agenda-title">{entry.task.title}</div>
                <div className="agenda-meta">
                  <span className={`status-dot ${entry.task.status}`} />
                  <span className="text-faint mono" style={{ fontSize: 12 }}>
                    {entry.task.status === "done" ? "concluída" : entry.task.status}
                  </span>
                </div>
              </div>
            ) : (
              <a
                className="agenda-row agenda-row-event"
                key={`event-${entry.event.id}`}
                href={entry.event.htmlLink}
                target="_blank"
                rel="noreferrer"
              >
                <div className="agenda-title">
                  <span className="agenda-google-badge">G</span>
                  {entry.event.summary || "(sem título)"}
                </div>
                <div className="agenda-meta">
                  <span className="text-faint mono" style={{ fontSize: 12 }}>
                    {eventTimeLabel(entry.event)}
                  </span>
                </div>
              </a>
            )
          )}
        </div>
      ))}
    </div>
  );
}
