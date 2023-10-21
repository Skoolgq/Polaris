// Don't touch
import { load } from './settings.js';
import Games from './games.js';
import Apps from './apps.js';
import Search from './search.js';
import Cheats from './cheats.js';
import Frame from './frame.js';
import PolarisError from './error.js';

const Settings = {
    load: load
};

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
        const randomID = 22;
        const game = games[randomID];

        document.querySelector('.featuredimg').addEventListener('click', () => {
            localStorage.setItem('frameData', JSON.stringify({
                type: 'game',
                game
            }));
			
            location.href = '/view';
        });
        document.querySelector('.featuredimg').src = '/assets/img/wide/crossyroad.webp';
    }).catch(e => new PolarisError('Failed to load featured game.'));
	
	fetch('/assets/JSON/changelog.json').then(res => res.json()).then(changelog => changelog.forEach(change => {
		const date = document.createElement('p');
		date.textContent = change.date;
		date.classList = 'small';
		document.querySelector('#changelog').appendChild(date);
		
		const description = document.createElement('p');
		description.textContent = change.simpleDescription;
		description.classList = 'small';
		document.querySelector('#changelog').appendChild(description);
	}));
}


const Polaris = { Settings, Games, Apps, Frame, PolarisError };
export default Polaris;
