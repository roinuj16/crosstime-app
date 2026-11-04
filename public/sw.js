/*
 * Service worker do CronoBox: deixa o web app abrir e funcionar sem internet.
 * - Páginas: tenta a rede primeiro (pega a versão nova), sem rede usa a última guardada.
 * - Arquivos (código, fontes, sons, voz): usa o guardado e só baixa o que falta.
 *   Os arquivos de código têm o hash no nome, então uma versão nova nunca reaproveita um velho.
 * Troque VERSION para descartar tudo o que está guardado.
 */
const VERSION = 'cronobox-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(['/', '/manifest.json', '/icons/icon-192.png'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('/', copy)); return res; })
        .catch(() => caches.match('/')),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    })),
  );
});
