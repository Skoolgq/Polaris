/* Stands for Web Proxy Manager because the keywork proxy is usually blocked */

import uv from './uv.js';

const load = () => {
    const scripts = [
        '/uv/uv.bundle.js'
    ];

    scripts.forEach(script => {
        const el = document.createElement('script');
        el.src = script;
        document.body.appendChild(el);

        if (script === '/uv/uv.bundle.js') {
            el.onload = () => {
                const el = document.createElement('script');
                el.src = '/uv/uv.config.js';
                document.body.appendChild(el);
            }
        }
    });

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

        //if (localStorage.getItem('proxy')) {
            try {
                await uv.registerSW();
            } catch (e) {
                console.error(e);
            }

            const url = getURL(query.value, 'https://www.google.com/search?q=%s');
            location.href = __uv$config.prefix + __uv$config.encodeUrl(url);
        //}
    });
}

export default { load };