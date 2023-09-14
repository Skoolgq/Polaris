let xor = {
    encode: (str, key = 2) => {
        if (!str) return str;

        return encodeURIComponent(str.split('').map((e, i) => i % key ? String.fromCharCode(e.charCodeAt(0) ^ key) : e).join(''));
    },
    decode: (str, key = 2) => {
        if (!str) return str;

        return decodeURIComponent(str).split('').map((e, i) => i % key ? String.fromCharCode(e.charCodeAt(0) ^ key) : e).join('');
    }
};

let workerLoaded;

const worker = async () => await navigator.serviceWorker.register('./sw.js', {
    scope: '/service/',
});

document.addEventListener('DOMContentLoaded', async () => {
    await worker();
    workerLoaded = true;
});

const dynamicRedirect = async (link) => {
    if (!workerLoaded) await worker();
    
    const url = /^(http(s)?:\/\/)?([\w-]+\.)+[\w]{2,}(\/.*)?$/.test(link) ?
        ((!link.startsWith('http://') && !link.startsWith('https://')) ? 'https://' + link : link) :
        'https://www.google.com/search?q=' + encodeURIComponent(link);
        
    location.href = `/service/${xor.encode(url)}`;
};

export { dynamicRedirect, worker, workerLoaded };