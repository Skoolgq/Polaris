import PolarisError from './error.js';

const tiltEffectSettings = {
    max: 8,
    perspective: 1000,
    scale: 1.05,
    speed: 800,
    easing: 'cubic-bezier(.03,.98,.52,.99)'
};

const load = () => {
    fetch('/assets/JSON/cheats.json').then(res => res.json()).then(cheats => {
      cheats.forEach(cheat => {
            const el = document.createElement('div');
            el.classList = 'game';
            el.innerHTML = `<img src='${cheat.image}'><h3>${cheat.name}</h3>`;
            document.querySelector('.games').appendChild(el);

            el.addEventListener('click', () => {
                localStorage.setItem('frameData', JSON.stringify({
                    type: 'cheat',
                    cheat
                }));
                location.href = '/view';
            });

            el.addEventListener('mouseenter', gameMouseEnter);
            el.addEventListener('mousemove', gameMouseMove);
            el.addEventListener('mouseleave', gameMouseLeave);
        });
    }).catch(e => new PolarisError('Failed to load cheats.'));
};

function gameMouseEnter(event) {
    setTransition(event);
}

function gameMouseMove(event) {
    const game = event.currentTarget;
    const gameWidth = game.offsetWidth;
    const gameHeight = game.offsetHeight;
    const centerX = game.offsetLeft + gameWidth / 2;
    const centerY = game.offsetTop + gameHeight / 2;
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    const rotateXUncapped = (+1) * tiltEffectSettings.max * mouseY / (gameHeight / 2);
    const rotateYUncapped = (-1) * tiltEffectSettings.max * mouseX / (gameWidth / 2);
    const rotateX = rotateXUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
        (rotateXUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateXUncapped);
    const rotateY = rotateYUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
        (rotateYUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateYUncapped);

    game.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) 
                          scale3d(${tiltEffectSettings.scale}, ${tiltEffectSettings.scale}, ${tiltEffectSettings.scale})`;
}

function gameMouseLeave(event) {
    event.currentTarget.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    setTransition(event);
}

function setTransition(event) {
    const game = event.currentTarget;
    clearTimeout(game.transitionTimeoutId);
    game.style.transition = `transform ${tiltEffectSettings.speed}ms ${tiltEffectSettings.easing}`;
    game.transitionTimeoutId = setTimeout(() => {
        game.style.transition = '';
    }, tiltEffectSettings.speed);
}

export default {
    load
};