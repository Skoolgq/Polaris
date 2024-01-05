importScripts('/dynamic/dynamic.config.js');
importScripts('/dynamic/dynamic.worker.js');

const sw = new Dynamic();

self.addEventListener('fetch', async (event) => {
    /*if (await sw.route(event)) */event.respondWith(sw.fetch(event));
    //else event.respondWith(fetch(event.request));
});