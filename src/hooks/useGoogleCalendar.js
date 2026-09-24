import { useCallback, useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const CONNECTED_KEY = "foco:google-calendar-connected";

function waitForGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const start = Date.now();
    const check = () => {
      if (window.google?.accounts?.oauth2) {
        resolve();
      } else if (Date.now() - start > 8000) {
        reject(new Error("Google Identity Services não carregou."));
      } else {
        setTimeout(check, 150);
      }
    };
    check();
  });
}

/**
 * Integração somente-leitura com o Google Agenda via Google Identity
 * Services (GIS), direto no navegador — sem back-end próprio, condizente
 * com o resto do app. O token de acesso fica só em memória (não persiste
 * no localStorage) e expira em ~1h; ao recarregar a página, tentamos uma
 * reconexão silenciosa (prompt vazio) se o usuário já tinha conectado
 * antes, o que costuma funcionar sem popup enquanto a sessão Google segue
 * ativa no navegador.
 */
export function useGoogleCalendar() {
  const [token, setToken] = useState(null); // { accessToken, expiresAt }
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const tokenClientRef = useRef(null);

  const connected = !!token && token.expiresAt > Date.now();

  const ensureClient = useCallback(async () => {
    if (!CLIENT_ID) {
      throw new Error(
        "VITE_GOOGLE_CLIENT_ID não configurado. Veja README > Google Agenda."
      );
    }
    await waitForGis();
    if (!tokenClientRef.current) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: () => {},
      });
    }
    return tokenClientRef.current;
  }, []);

  const requestToken = useCallback(
    (prompt) =>
      new Promise((resolve, reject) => {
        ensureClient()
          .then((client) => {
            client.callback = (resp) => {
              if (resp.error) {
                reject(new Error(resp.error));
                return;
              }
              const expiresAt = Date.now() + (Number(resp.expires_in) - 60) * 1000;
              resolve({ accessToken: resp.access_token, expiresAt });
            };
            client.requestAccessToken({ prompt });
          })
          .catch(reject);
      }),
    [ensureClient]
  );

  const connect = useCallback(async () => {
    setError("");
    setConnecting(true);
    try {
      const t = await requestToken("consent");
      setToken(t);
      localStorage.setItem(CONNECTED_KEY, "1");
    } catch (err) {
      setError(err.message || "Não foi possível conectar ao Google Agenda.");
    } finally {
      setConnecting(false);
    }
  }, [requestToken]);

  const disconnect = useCallback(() => {
    if (token?.accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token.accessToken, () => {});
    }
    setToken(null);
    localStorage.removeItem(CONNECTED_KEY);
  }, [token]);

  useEffect(() => {
    if (localStorage.getItem(CONNECTED_KEY) !== "1") return;
    requestToken("").then(setToken).catch(() => {
      localStorage.removeItem(CONNECTED_KEY);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = useCallback(
    async ({ timeMin, timeMax }) => {
      if (!token) return [];
      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      });
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        { headers: { Authorization: `Bearer ${token.accessToken}` } }
      );
      if (res.status === 401) {
        setToken(null);
        localStorage.removeItem(CONNECTED_KEY);
        throw new Error("Sessão do Google expirou. Conecte de novo.");
      }
      if (!res.ok) throw new Error("Falha ao buscar eventos do Google Agenda.");
      const data = await res.json();
      return data.items || [];
    },
    [token]
  );

  return { connected, connecting, error, connect, disconnect, fetchEvents };
}
