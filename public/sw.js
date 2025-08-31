self.addEventListener("install", e => {
  console.log("Service Worker instalado");
});

self.addEventListener("fetch", e => {
  // Estrategia básica: dejar que el navegador maneje las solicitudes
});
