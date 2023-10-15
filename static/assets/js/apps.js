import PolarisError from './error.js';
import { workerLoaded, loadWorker } from './wpm.js';

const tiltEffectSettings = {
    max: 8, // max tilt rotation (degrees (deg))
    perspective: 1000, // transform perspective, the lower the more extreme the tilt gets (pixels (px))
    scale: 1.05, // transform scale - 2 = 200%, 1.5 = 150%, etc..
    speed: 800, // speed (transition-duration) of the enter/exit transition (milliseconds (ms))
    easing: 'cubic-bezier(.03,.98,.52,.99)' // easing (transition-timing-function) of the enter/exit transition
};

const load = () => {
    fetch('/assets/JSON/apps.json').then(res => res.json()).then(apps => {
        apps.forEach(app => {
            const el = document.createElement('div');
            el.classList = 'app';
            el.innerHTML = `<img src='${app.image}'><h3>${app.name}</h3>`;
            document.querySelector('.apps').appendChild(el);

            el.addEventListener('click', async () => {
                if (!workerLoaded) await loadWorker();
                localStorage.setItem('frameData', JSON.stringify({
                    type: 'app',
                    app
                }));
                location.href = '/view';
            });

            el.addEventListener('mouseenter', appMouseEnter);
            el.addEventListener('mousemove', appMouseMove);
            el.addEventListener('mouseleave', appMouseLeave);
        });
    }).catch(e => new PolarisError('Failed to load Apps'));
};

function appMouseEnter(event) {
    setTransition(event);
}

function appMouseMove(event) {
    const app = event.currentTarget;
    const appWidth = app.offsetWidth;
    const appHeight = app.offsetHeight;
    const centerX = app.offsetLeft + appWidth / 2;
    const centerY = app.offsetTop + appHeight / 2;
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    const rotateXUncapped = (+1) * tiltEffectSettings.max * mouseY / (appHeight / 2);
    const rotateYUncapped = (-1) * tiltEffectSettings.max * mouseX / (appWidth / 2);
    const rotateX = rotateXUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
        (rotateXUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateXUncapped);
    const rotateY = rotateYUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
        (rotateYUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateYUncapped);

    app.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) 
                          scale3d(${tiltEffectSettings.scale}, ${tiltEffectSettings.scale}, ${tiltEffectSettings.scale})`;
}

function appMouseLeave(event) {
    event.currentTarget.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    setTransition(event);
}

function setTransition(event) {
    const app = event.currentTarget;
    clearTimeout(app.transitionTimeoutId);
    app.style.transition = `transform ${tiltEffectSettings.speed}ms ${tiltEffectSettings.easing}`;
    app.transitionTimeoutId = setTimeout(() => {
        app.style.transition = '';
    }, tiltEffectSettings.speed);
}

export default {
    load
};
