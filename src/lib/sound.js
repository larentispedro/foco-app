let audioCtx;

// Dois bipes curtos via Web Audio API — evita precisar de um arquivo de
// áudio como asset. Silencioso se o navegador bloquear (ex: sem interação
// prévia do usuário), já que start/stop de um ciclo sempre vem de um clique.
export function playChime() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    [0, 0.16].forEach((delay, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = i === 0 ? 880 : 1174.66;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.2, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.32);
    });
  } catch {
    // Web Audio indisponível — segue sem som
  }
}
