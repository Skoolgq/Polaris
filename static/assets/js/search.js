import PolarisError from '/assets/js/error.js';
import { loadWorker } from '/assets/js/wpm.js';

const load = () => {
    const xor = {
        encode: (str, key = 2) => {
            if (!str) return str;
            return encodeURIComponent(str.split('').map((e, i) => i % key ? String.fromCharCode(e.charCodeAt(0) ^ key) : e).join(''));
        },
        decode: (str, key = 2) => {
            if (!str) return str;
            return decodeURIComponent(str).split('').map((e, i) => i % key ? String.fromCharCode(e.charCodeAt(0) ^ key) : e).join('');
        }
    };

    const form = document.querySelector('#wpf');
    const query = document.querySelector('#query');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (typeof navigator.serviceWorker === 'undefined') new PolarisError('Failed to load Proxy');
        await loadWorker('uv');

        const url = /^(http(s)?:\/\/)?([\w-]+\.)+[\w]{2,}(\/.*)?$/.test(query.value) ? ((!query.value.startsWith('http://') && !query.value.startsWith('https://')) ? 'https://' + query.value : query.value) : 'https://www.google.com/search?q=' + encodeURIComponent(query.value);

        localStorage.setItem('frameData', JSON.stringify({
            type: 'proxy',
            source: `/uv/service/${xor.encode(url)}`
        }));
        location.href = '/view';
    });
}

export default { load };
