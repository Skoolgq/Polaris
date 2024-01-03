import { createViewPage, isValidURL } from './utils.js';
import PolarisError from './error.js';
import effects from './effects.js';

const load = () => fetch('/api/apps').then(res => res.json()).then(apps => {
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
            document.body.style.opacity = '0.7';

            setTimeout(() => {
                if (isValidURL(app.target)) createViewPage({
                    target: app.target,
                    title: app.name,
                    proxied: true
                });
                else createViewPage({
                    target: app.target,
                    title: app.name
                });
            }, 500);
        });
    });
}).catch(e => new PolarisError('Failed to load Apps'));

export default {
    load
};