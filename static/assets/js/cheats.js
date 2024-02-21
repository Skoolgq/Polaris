import { createViewPage, isValidURL, PolarisError } from './utils.js';
import effects from './effects.js';

const load = () => fetch('/api/cheats')
    .then(res => res.json())
    .then(cheats => cheats.forEach(cheat => {
        const el = document.createElement('div');
        el.classList = 'game';
        document.querySelector('.cheats').appendChild(el);
        
        const image = document.createElement('img');
        image.src = cheat.image;
        image.onerror = () => image.src = '/assets/img/logo.png';
        el.appendChild(image);

        const name = document.createElement('h3');
        name.textContent = cheat.name;
        el.appendChild(name);

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
            }, 1000);
        });
    })).catch(e => new PolarisError('Failed to load cheats.'));

export default {
    load
};