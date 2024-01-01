import PolarisError from '/assets/js/error.js';
import { loadProxyWorker } from '/assets/js/utils.js';

const tiltEffectSettings = {
    max: 8,
    perspective: 1000,
    scale: 1.05,
    speed: 800,
    easing: 'cubic-bezier(.03,.98,.52,.99)'
};

let games = [];
let filteredGames = [];

const load = () => {
    fetch('/assets/JSON/games.json').then(res => res.json()).then(data => {
            games = data;
            filteredGames = games;

            renderGames(filteredGames);

            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', filterGames);
        })
        .catch(e => new PolarisError('Failed to load games'));
};

function filterGames() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();

    filteredGames = games.filter(game => game.name.toLowerCase().includes(searchTerm));

    renderGames(filteredGames);
}

function renderGames(gamesToRender) {
    const gamesContainer = document.querySelector('.games');
    const popularGamesContainer = document.querySelector('.popular-games');
    gamesContainer.innerHTML = '';
    popularGamesContainer.innerHTML = '';

    gamesToRender.forEach(game => {
        const el = document.createElement('div');
        el.classList = 'game';
        el.innerHTML = `<img loading='lazy' src='${game.image}'><h3>${game.name}</h3>`;
        gamesContainer.appendChild(el);

        if (game.popular === 'yes') {
            const popularEl = document.createElement('div');
            popularEl.classList = 'game';
            popularEl.innerHTML = `<img loading='lazy' src='${game.image}'><h3>${game.name}</h3>`;
            popularGamesContainer.appendChild(popularEl);

            popularEl.addEventListener('click', async () => {
                await loadProxyWorker('uv');

                if (game.openinnewtab === 'yes') window.open(game.source);
                else {
                  localStorage.setItem('frameData', JSON.stringify({
                    type: 'game',
                    game
                  }));
                  location.href = '/view';
                }
              });

            popularEl.addEventListener('mouseenter', gameMouseEnter);
            popularEl.addEventListener('mousemove', gameMouseMove);
            popularEl.addEventListener('mouseleave', gameMouseLeave);
        }

        el.addEventListener('click', async () => {
            await loadProxyWorker();

            const frameData = {
              type: 'game',
              game
            };

            if (game.openinnewtab === 'yes') {
                window.open(game.source, '_blank');
                console.log('Open game in new tab:', frameData);
            } else {
              localStorage.setItem('frameData', JSON.stringify(frameData));
              location.href = '/view';
            }
          });

        el.addEventListener('mouseenter', gameMouseEnter);
        el.addEventListener('mousemove', gameMouseMove);
        el.addEventListener('mouseleave', gameMouseLeave);
    });
}

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
    const rotateX = rotateXUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max : (rotateXUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateXUncapped);
    const rotateY = rotateYUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max : (rotateYUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateYUncapped);

    game.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${tiltEffectSettings.scale}, ${tiltEffectSettings.scale}, ${tiltEffectSettings.scale})`;
}

function gameMouseLeave(event) {
    event.currentTarget.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    setTransition(event);
}

function setTransition(event) {
    const game = event.currentTarget;
    clearTimeout(game.transitionTimeoutId);
    game.style.transition = `transform ${tiltEffectSettings.speed}ms ${tiltEffectSettings.easing}`;

    game.transitionTimeoutId = setTimeout(() => game.style.transition = '', tiltEffectSettings.speed);
}

export default {
    load
};