/* Stands for Web proxy Manager because the keywork proxy is usually blocked */

import { isUrl, prependHttps, worker, workerLoaded } from './dynamic.js';
import uv from './uv.js';

const getSetting = (name) => {
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({}));
    } else {
        try {
            JSON.parse(localStorage.getItem('settings'));
        } catch (e) {
            localStorage.setItem('settings', JSON.stringify({}));
        }
    }

    const settings = JSON.parse(localStorage.getItem('settings'));
    return settings[name];
}

uv.load();

const load = () => {
    const getURL = (input, template) => {
        try {
            return new URL(input).toString();
        } catch (e) { }

        try {
            const url = new URL(`http://${input}`);
            if (url.hostname.includes('.')) return url.toString();
        } catch (e) { }

        return template.replace('%s', encodeURIComponent(input));
    }


    const form = document.querySelector('#wpf');
    const query = document.querySelector('#query');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (getSetting('proxy_type') === 'ultraviolet' || !getSetting('proxy_type')) {
            const url = getURL(query.value, 'https://www.google.com/search?q=%s');
            location.href = Easyviolet.getProxiedUrl(url);
        } else if (getSetting('proxy_type') === 'dynamic') {
            if (typeof navigator.serviceWorker === 'undefined') new PolarisError('Failed to load proxy');

            if (!workerLoaded) await worker();

            const url = isUrl(query.value) ? prependHttps(query.value) : 'https://www.google.com/search?q=' + encodeURIComponent(query.value);

            window.location.href = '/dynamic/service/route?url=' + encodeURIComponent(url);
        }
    });
}

export default { load };
