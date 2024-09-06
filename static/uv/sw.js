// UV Transports
importScripts('/assets/js/bare-transport.js');
importScripts('/libcurl/index.cjs');
importScripts('/epoxy/index.js');

importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts(__uv$config.sw || '/uv/uv.sw.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', (event) => event.respondWith(sw.fetch(event)));