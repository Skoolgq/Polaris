import { createViewPage, isValidURL } from './utils.js';
import PolarisError from './error.js';
import effects from './effects.js';

const load = () => fetch('/api/cheats')
    .then(res => res.json())
    .then(cheats => cheats.forEach(cheat => {
        const el = document.createElement('div');
        el.classList = 'game';
        el.innerHTML = `<img src='${cheat.image}'><h3>${cheat.name}</h3>`;
        document.querySelector('.cheats').appendChild(el);

        effects.hoverTilt({
            max: 8,
            perspective: 1000,
            scale: 1.05,
            speed: 800,
            easing: 'cubic-bezier(.03,.98,.52,.99)'
        }, el);

        el.addEventListener('click', () => {
            document.body.style.opacity = '0.7';

            setTimeout(() => {
                if (isValidURL(cheat.target)) createViewPage({
                    target: cheat.target,
                    title: cheat.name,
                    proxied: true
                });
                else createViewPage({
                    target: cheat.target,
                    title: cheat.name
                });
            }, 500);
        });
    })).catch(e => new PolarisError('Failed to load cheats.'));

export default {
    load
};