/* Stands for Web prxy Manager because the keywork prxy is usually blocked */

import uv from './uv.js';

uv.load();

const load = () => {
    function getURL(input, template) {
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

        const url = getURL(query.value, 'https://www.google.com/search?q=%s');
        location.href = Easyviolet.getProxiedUrl(url);
    });
}

export default { load };
