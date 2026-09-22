import { useCallback, useEffect, useState } from "react";

export function isPipSupported() {
  return typeof window !== "undefined" && "documentPictureInPicture" in window;
}

/**
 * Abre a janela real de Picture-in-Picture (Document PiP, só Chrome/Edge
 * por enquanto). Duas coisas que não são óbvias:
 *
 * - A janela do PiP tem um `document` PRÓPRIO. Ela não herda nenhum CSS
 *   da página que a abriu — por isso clonamos cada <link>/<style> do
 *   <head> atual para dentro do <head> da janela nova.
 * - Ela só existe enquanto ESTA aba segue aberta (pode estar minimizada
 *   ou em outra aba do SO em foreground, mas o processo do navegador
 *   com essa aba precisa continuar vivo). Fechar a aba fecha o PiP.
 */
export function useDocumentPip() {
  const [pipWindow, setPipWindow] = useState(null);
  const supported = isPipSupported();

  const copyStyles = useCallback((pipDoc) => {
    [...document.styleSheets].forEach((sheet) => {
      if (sheet.href) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = sheet.href;
        pipDoc.head.appendChild(link);
      } else {
        try {
          const style = document.createElement("style");
          style.textContent = [...sheet.cssRules]
            .map((rule) => rule.cssText)
            .join("\n");
          pipDoc.head.appendChild(style);
        } catch {
          // folha de estilo inacessível por CORS — ignora
        }
      }
    });
  }, []);

  const open = useCallback(async () => {
    if (!supported || pipWindow) return;
    const pip = await window.documentPictureInPicture.requestWindow({
      width: 280,
      height: 210,
    });

    copyStyles(pip.document);
    pip.document.body.style.margin = "0";
    pip.document.body.style.background = "var(--bg, #14161a)";
    pip.document.body.style.display = "flex";
    pip.document.body.style.alignItems = "center";
    pip.document.body.style.justifyContent = "center";
    pip.document.body.style.height = "100%";

    pip.addEventListener("pagehide", () => setPipWindow(null), {
      once: true,
    });

    setPipWindow(pip);
  }, [supported, pipWindow, copyStyles]);

  const close = useCallback(() => {
    if (pipWindow && !pipWindow.closed) pipWindow.close();
    setPipWindow(null);
  }, [pipWindow]);

  // Se o componente que controla o timer desmontar (ex.: navegação SPA
  // não deveria desmontar isso, mas por segurança) fecha a janela junto.
  useEffect(() => {
    return () => {
      if (pipWindow && !pipWindow.closed) pipWindow.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { supported, pipWindow, open, close };
}
