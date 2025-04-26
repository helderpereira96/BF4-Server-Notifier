/// <reference lib="webworker" />

let interval: number | undefined;

// Inicia imediatamente ao ser criado
self.postMessage({ type: "worker_ready" });

addEventListener("message", ({ data }) => {
  if (data.command === "start") {
    interval = setInterval(() => {
      self.postMessage({ type: "tick" });
    }, 1000) as unknown as number;
  }
});

addEventListener("error", (e) => {
  console.error("[Worker] Error:", e);
});
