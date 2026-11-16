// Service worker do painel: guarda o que já foi aberto para usar sem internet.
// Troque VERSAO quando quiser forçar a limpeza do que ficou guardado.
const VERSAO = 'v1';
const FIXOS = `bolivar-fixos-${VERSAO}`;
const TILES = `bolivar-satelite-${VERSAO}`;
const MAX_TILES = 400;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes.filter((n) => n !== FIXOS && n !== TILES).map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function limitar(cache, max) {
  const chaves = await cache.keys();
  for (let i = 0; i < chaves.length - max; i++) await cache.delete(chaves[i]);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Satélite Esri: usa o que já foi visto e atualiza em segundo plano.
  if (url.hostname === 'server.arcgisonline.com') {
    event.respondWith(
      caches.open(TILES).then(async (cache) => {
        const guardado = await cache.match(req);
        const rede = fetch(req)
          .then((r) => {
            if (r.ok || r.type === 'opaque') {
              cache.put(req, r.clone()).then(() => limitar(cache, MAX_TILES));
            }
            return r;
          })
          .catch(() => guardado);
        return guardado || rede;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Páginas: rede primeiro (para ver sempre a versão nova), guardado se offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone();
          caches.open(FIXOS).then((c) => c.put(req, copia));
          return r;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(self.registration.scope)))
    );
    return;
  }

  // Arquivos (scripts, mapas, imagens): guardado primeiro, rede se faltar.
  event.respondWith(
    caches.match(req).then(
      (guardado) =>
        guardado ||
        fetch(req).then((r) => {
          if (r.ok) {
            const copia = r.clone();
            caches.open(FIXOS).then((c) => c.put(req, copia));
          }
          return r;
        })
    )
  );
});
