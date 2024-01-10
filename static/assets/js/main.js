import loadEasterEggs from './eastereggs.js';
import { createViewPage, isValidURL, getVH } from './utils.js';
import PolarisError from './error.js';
import Settings from './settings.js';
import Search from './search.js';
import Cheats from './cheats.js';
import Games from './games.js';
import Apps from './apps.js';

loadEasterEggs();

onbeforeunload = (e) => {
    document.body.style.opacity = '0.7';

    if (localStorage.getItem('prevent_close') === 'true') {
        e.preventDefault();
        
        return e;
    }
}

/*await navigator.serviceWorker.register('/assets/js/offline.js', {
    scope: '/'
});*/

window.addEventListener('DOMContentLoaded', () => setTimeout(() => document.body.style.opacity = 1, 1000));

document.querySelectorAll('a').forEach(hyperlink => hyperlink.addEventListener('click', (e) => {
    if (hyperlink.href && !hyperlink.target && new URL(hyperlink.href).pathname !== location.pathname) {
        e.preventDefault();
        document.body.style.opacity = '0.7';

        setTimeout(() => window.location.href = hyperlink.href, 500);
    }
}));

window.onhashchange = () => {
    if (location.hash === '#settings') document.querySelector('.sidebar').classList.add('active');
    else document.querySelector('.sidebar').classList.remove('active');
};

if (window.self === window.top && location.pathname !== '/view') setTimeout(async () => {
    Settings.load();

    if (location.pathname === '/games') Games.load();
    if (location.pathname === '/apps') Apps.load();
    if (location.pathname === '/search') Search.load();
    if (location.pathname === '/cheats') Cheats.load();
}, 500);

fetch('/api/changelog')
        .then(res => res.json())
        .then(changelog => {
            document.querySelector('#version').textContent = changelog.version !== 'unknown' ? 'v' + changelog.version : changelog.version;
            document.querySelector('#version_sha').textContent = changelog.commit.sha.slice(0, 7);
            document.querySelector('#up_to_date').textContent = changelog.upToDate ? 'yes' : 'no';
        });

if (location.pathname === '/') {
    fetch('/api/games')
        .then(res => res.json())
        .then(games => {
            const gameName = 'Fortnite';
            const game = games.all.filter(g => g.name === gameName)[0];

            document.querySelector('.featured').addEventListener('click', () => {
                if (isValidURL(game.target)) createViewPage({
                    target: game.target,
                    title: game.name,
                    proxied: true
                });
                else createViewPage({
                    target: game.target,
                    title: game.name
                });
            });

            document.querySelector('.featured').src = '/assets/img/wide/fortnite.jpg';
        }).catch(e => new PolarisError('Failed to load featured game.'));

    const logHeight = () => {
        const log = document.createElement('div');
        document.querySelector('#changelog').appendChild(log);

        const date = document.createElement('p');
        date.textContent = 'a';
        date.classList = 'small';
        log.appendChild(date);

        const description = document.createElement('i');
        description.textContent = 'a';
        description.classList = 'small';
        log.appendChild(description);

        const height = log.clientHeight;

        log.remove();

        return height;
    };

    const getAvalibleHeight = () => {
        var total = 0;
        
        document.querySelectorAll('.container.right>*:not(#changelog)').forEach(el => total += Number((el.currentStyle || window.getComputedStyle(el)).marginTop.replace('px', '')) + Number((el.currentStyle || window.getComputedStyle(el)).marginTop.replace('px', '')) + el.clientHeight);

        return (document.querySelector('.container.right').clientHeight - getVH(2)) - total;
    }

    fetch('/api/changelog')
        .then(res => res.json())
        .then(changelog => {
            changelog.changelog
                .filter((data, i) => !(i >= 3))
                .forEach(change => {
                    const log = document.createElement('div');
                    document.querySelector('#changelog').appendChild(log);

                    const date = document.createElement('p');
                    date.textContent = change.date;
                    date.classList = 'small';
                    log.appendChild(date);

                    const description = document.createElement('i');
                    description.textContent = change.simpleDescription;
                    description.classList = 'small';
                    log.appendChild(description);

                });

            const updateChangelog = (amount = 3) => {
                amount = amount - 1;

                for (let i = 0; i < document.querySelector('#changelog').children.length; i++) {
                    if (i > amount) document.querySelector('#changelog').children[i].classList.add('hidden');
                    else document.querySelector('#changelog').children[i].classList.remove('hidden');
                }
            }

            updateChangelog(Math.floor(getAvalibleHeight() / logHeight()));
            window.addEventListener('resize', () => updateChangelog(Math.floor(getAvalibleHeight() / logHeight())));
        });
}

if (window.self === window.top && location.pathname !== '/view') {
    if (window.scrollY !== 0) document.querySelector('.navbar').classList.add('scrolling');
    else document.querySelector('.navbar').classList.remove('scrolling');
}

if (window.self === window.top && location.pathname !== '/view') window.onscroll = () => {
    if (window.scrollY !== 0) document.querySelector('.navbar').classList.add('scrolling');
    else document.querySelector('.navbar').classList.remove('scrolling');
}

if (window.self !== window.top && document.querySelector('.navbar')) document.querySelector('.navbar').remove();