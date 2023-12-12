import loadEasterEggs from '/assets/js/eastereggs.js';
import PolarisError from '/assets/js/error.js';
import { load } from '/assets/js/settings.js';
import Search from '/assets/js/search.js';
import Cheats from '/assets/js/cheats.js';
import Games from '/assets/js/games.js';
import Frame from '/assets/js/frame.js';
import Apps from '/assets/js/apps.js';

const Settings = {
    load: load
};

loadEasterEggs();

onbeforeunload = (e) => {
    if (localStorage.getItem('prevent_close') === 'true') {
        e.preventDefault();
        return e;
    }

    sessionStorage.clear();
}

window.onhashchange = () => {
    if (location.hash === '#settings') document.querySelector('.sidebar').classList.add('active');
    else document.querySelector('.sidebar').classList.remove('active');
};

if (window.self === window.top) {
    setTimeout(async () => {
        Settings.load();

        if (location.pathname === '/games') Games.load();
        if (location.pathname === '/apps') Apps.load();
        if (location.pathname === '/search') Search.load();
        if (location.pathname === '/cheats') Cheats.load();
        if (location.pathname === '/view') Frame.load();
    }, 500);
}

if (location.pathname === '/') {
    fetch('/assets/JSON/games.json').then(res => res.json()).then(games => {
        const gameName = 'Tiny Fishing';
        const game = games.filter(g => g.name === gameName)[0];

        document.querySelector('.featured').addEventListener('click', () => {
            localStorage.setItem('frameData', JSON.stringify({
                type: 'game',
                game
            }));

            location.href = '/view';
        });
        document.querySelector('.featured').src = '/assets/img/wide/tinyfishing.png';
    }).catch(e => new PolarisError('Failed to load featured game.'));

    fetch('/assets/JSON/changelog.json').then(res => res.json()).then(changelog => changelog.forEach(change => {
        const date = document.createElement('p');
        date.textContent = change.date;
        date.classList = 'small';
        document.querySelector('#changelog').appendChild(date);

        const descwrap = document.createElement('p');
        const description = document.createElement('i');
        description.textContent = change.simpleDescription;
        description.classList = 'small';
        document.querySelector('#changelog').appendChild(description);
    }));
}

if (window.scrollY !== 0) document.querySelector('.navbar').classList.add('scrolling');
else document.querySelector('.navbar').classList.remove('scrolling');

window.onscroll = () => {
    if (window.scrollY !== 0) document.querySelector('.navbar').classList.add('scrolling');
    else document.querySelector('.navbar').classList.remove('scrolling');
}

export default { Settings, Games, Apps, Frame, PolarisError };
