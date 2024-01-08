// WIP

const serverOnline = () => new Promise(async (resolve, reject) => {
    try {
        await fetch('/');
        resolve(true);
    } catch { resolve(false); }
});

self.addEventListener('fetch', async (e) => {
    if (self.navigator.onLine) e.respondWith('offline');
    else if (await serverOnline()) e.respondWith('nooo');
});