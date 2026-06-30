/**
 * Diagnóstico global para GitHub Pages
 * Detecta y reporta errores sin bloquer la aplicación
 */

// Capturar errores no manejados
window.addEventListener("error", (event) => {
  console.error("[DIAGNOSTIC] Uncaught error:", event.error);
  if (event.error && event.error.stack) {
    console.error("[DIAGNOSTIC] Stack trace:", event.error.stack);
  }
});

// Capturar promesas rechazadas sin handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("[DIAGNOSTIC] Unhandled promise rejection:", event.reason);
  if (event.reason && event.reason.stack) {
    console.error("[DIAGNOSTIC] Stack trace:", event.reason.stack);
  }
});

// Log de carga de módulos
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  return originalFetch.apply(this, args)
    .then((response) => {
      if (!response.ok) {
        console.warn(`[DIAGNOSTIC] Fetch failed: ${url} (${response.status})`);
      }
      return response;
    })
    .catch((error) => {
      console.error(`[DIAGNOSTIC] Fetch error: ${url}`, error);
      throw error;
    });
};

// Log de importaciones de módulos
document.addEventListener("DOMContentLoaded", () => {
  console.log("[DIAGNOSTIC] Page loaded:", {
    url: window.location.href,
    title: document.title,
    scripts: document.querySelectorAll("script").length,
    modules: document.querySelectorAll('script[type="module"]').length
  });
});

console.log("[DIAGNOSTIC] Diagnostics initialized");
