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
        const gameName = 'Tiny Fishing';
        const game = games.filter(g => g.name === gameName)[0];

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
/*
var items = ['the start', 'What are you doing here?', '"School"', 'I dont get paid enough','What Up Son?','help','i like bagle','3.14159265359','Who thought this was a good idea?','Stage 4','i have a concerning lump on my back','Bean was here','Your Mother','Pacer Test','Why did he leave','by the way...','Kilroy was here','Kilroy is here','look behind you','West Virginia','theres a reason','Country road','Thats a wrap','Pretty','No','Yes','leave me','What square?','uhhh','Plutocracy','Practically Free*','capitalize this','Place Holder','Try me','fine','Why are we doing this again?','half eaten saltine crackers are underated','Javascript > Java','L + Ratio','Cope','I Love Refrigerators','That Happened.','Pedicure','(insert message here)','terminal','💀💀💀','finnish','who writes these?','reference','I am going to peel the skin off your face (:','bye','no','the fact is','run','uh what','hello world','Positively awful','tax fraud','comatose state','Not me','my second job is a discord mod','kids bop','Is it just me or','Hello people','74% Incomplete','wake up','Monster Energy','ew','The amount of pain I am in right now is unimaginable','chicken','men','What?','Your opinion is invalid','gay pride','Im going','4skin','/0','Who said that?','No Fair.','Famous... Enough','Parent Approved!','Teacher Approved!','Treason','Just do it already!','You\'re Fired','Not worth it','was there a reason?','the egg came first','patriotism','Family Friendly','Do you ever feel like a plastic bag Drifting through the windWanting to start again? Do you ever feel, feel so paper thin Like a house of cards One blow from caving in?','Why?','discord is in the first o','Shane Dawson likes cats','who stole this','unblock linux','darn you','gushers','yummy','charles loves you','mekhi loves anime', 'pls dont type smurf :)'];

  function getRandomFact() {
    var randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }

  // When the page loads, set the innerHTML of elements with class 'blue' to a random item
  window.addEventListener('load', function() {
    var blue = document.getElementsByClassName('blue');
    for (var i = 0; i < blue.length; i++) {
      blue[i].innerHTML = getRandomFact();
    }
  });
*/
}
const Polaris = { Settings, Games, Apps, Frame, PolarisError };
export default Polaris;
