import { loadProxyWorker } from './utils.js';
import PolarisError from './error.js';
import effects from './effects.js';

const load = () => {
    fetch('/assets/JSON/apps.json').then(res => res.json()).then(apps => {
        apps.forEach(app => {
            const el = document.createElement('div');
            el.classList = 'app';
            el.innerHTML = `<img src='${app.image}'><h3>${app.name}</h3>`;
            document.querySelector('.apps').appendChild(el);

            effects.hoverTilt({
                max: 8,
                perspective: 1000,
                scale: 1.05,
                speed: 800,
                easing: 'cubic-bezier(.03,.98,.52,.99)'
            }, el);

            el.addEventListener('click', async () => {
                await loadProxyWorker('uv');

                localStorage.setItem('frameData', JSON.stringify({
                    type: 'app',
                    app
                }));
                location.href = '/view';
            });
        });
    }).catch(e => new PolarisError('Failed to load Apps'));
};

export default {
    load
};