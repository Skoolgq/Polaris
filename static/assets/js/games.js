import PolarisError from './error.js';
import { workerLoaded, loadWorker } from './wpm.js';

const tiltEffectSettings = {
    max: 8, // max tilt rotation (degrees (deg))
    perspective: 1000, // transform perspective, the lower the more extreme the tilt gets (pixels (px))
    scale: 1.05, // transform scale - 2 = 200%, 1.5 = 150%, etc..
    speed: 800, // speed (transition-duration) of the enter/exit transition (milliseconds (ms))
    easing: 'cubic-bezier(.03,.98,.52,.99)' // easing (transition-timing-function) of the enter/exit transition
};

let games = []; // store all games
let filteredGames = []; // store filtered games

const load = () => {
    fetch('/assets/JSON/games.json').then(res => res.json()).then(data => {
            games = data;
            filteredGames = games; // initialize filtered games with all games

            renderGames(filteredGames); // render games initially

            // Add event listener to search input
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', filterGames);
        })
        .catch(e => {
            new PolarisError('Failed to load games');
        });
};

function filterGames() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();

    filteredGames = games.filter(game => game.name.toLowerCase().includes(searchTerm));

    renderGames(filteredGames); // render filtered games
}

function renderGames(gamesToRender) {
    const gamesContainer = document.querySelector('.games');
    const popularGamesContainer = document.querySelector('.popular-games');
    gamesContainer.innerHTML = ''; // clear previous games
    popularGamesContainer.innerHTML = ''; // clear previous popular games

    function openGameInNewTab(game) {
    const x = window.open('about:blank', '_blank');
    const index = game.source;
    x.document.write(`<iframe src="${index}" style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;"></iframe>`);
}

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
                if (!workerLoaded) await loadWorker();
                const frameData = {
                  type: 'game',
                  game
                };
                if (game.openinnewtab === 'yes') {
                    window.open(game.source, '_blank');
                    console.log('Open game in new tab:', frameData);
                } else if (game.openinaboutblank === 'yes') {
                    openGameInNewTab(game);
                    console.log('Open game in about:blank:', frameData);
                } else {
                    localStorage.setItem('frameData', JSON.stringify(frameData));
                    location.href = '/view';
                }
              });

            popularEl.addEventListener('mouseenter', gameMouseEnter);
            popularEl.addEventListener('mousemove', gameMouseMove);
            popularEl.addEventListener('mouseleave', gameMouseLeave);
        }

        el.addEventListener('click', async () => {
            if (!workerLoaded) await loadWorker();
            const frameData = {
              type: 'game',
              game
            };
            if (game.openinnewtab === 'yes') {
                    window.open(game.source, '_blank');
                    console.log('Open game in new tab:', frameData);
                } else if (game.openinaboutblank === 'yes') {
                    openGameInNewTab(game);
                    console.log('Open game in about:blank:', frameData);
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
    const rotateX = rotateXUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
        (rotateXUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateXUncapped);
    const rotateY = rotateYUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
        (rotateYUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateYUncapped);

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
    game.transitionTimeoutId = setTimeout(() => {
        game.style.transition = '';
    }, tiltEffectSettings.speed);
}

export default {
    load
};
