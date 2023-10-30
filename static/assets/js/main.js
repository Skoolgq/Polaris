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
        const randomID = 75;
        const game = games[randomID];

        document.querySelector('.featuredimg').addEventListener('click', () => {
            localStorage.setItem('frameData', JSON.stringify({
                type: 'game',
                game
            }));
			
            location.href = '/view';
        });
        document.querySelector('.featuredimg').src = '/assets/img/wide/tinyfishing.png';
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

function aboutblank() {
    const tab = window.open('about:blank', '_blank');
    const iframe = tab.document.createElement('iframe');
    const stl = iframe.style;
    stl.border = stl.outline = 'none';
    stl.width = '100vw';
    stl.height = '100vh';
    stl.position = 'fixed';
    stl.left = stl.right = stl.top = stl.bottom = '0';
    iframe.src = self.location;
    tab.document.body.appendChild(iframe);
    window.parent.window.location.replace(localStorage.getItem("panic_url") || 'https://google.com/')
}

if (window.self !== window.self) document.querySelector("#launchab").style.display = "none"
document.getElementById("aboutblankbtn").addEventListener("click", function() {
    aboutblank();
});
}
const Polaris = { Settings, Games, Apps, Frame, PolarisError };
export default Polaris;
