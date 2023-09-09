var workerLoaded;

const worker = async () => {
    return false;
    return await navigator.serviceWorker.register('/dynamic/sw.js', {
        scope: '/dynamic/service',
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await worker();

    workerLoaded = true;
});

const prependHttps = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) return 'https://' + url;

    return url;
}

const isUrl = (val = '') => {
    const urlPattern = /^(http(s)?:\/\/)?([\w-]+\.)+[\w]{2,}(\/.*)?$/;
    return urlPattern.test(val);
}

export { isUrl, prependHttps, worker, workerLoaded };