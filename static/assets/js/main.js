// THIS FILE IS CRITICAL, DO NOT TOUCH UNLESS YOU KNOW WHAT YOU'RE DOING
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
        const randomID = 46; // :3
        const game = games[randomID];

        document.querySelector('.featuredimg').addEventListener('click', () => {
            localStorage.setItem('frameData', JSON.stringify({
                type: 'game',
                game
            }));
            location.href = '/view';
        });
        document.querySelector('.featuredimg').src = game.image;
    }).catch(e => new PolarisError('Failed to load featured game.'));
}
// Define a variable to track whether the audio has been played
let audioPlayed = false;

// Function to play the audio
function playSmurfAudio() {
  if (!audioPlayed) {
    const audio = new Audio('/assets/misc/smurf.mp3');
    audio.play();
    audioPlayed = true;
  }
}

// Event listener to check for the word "smurf"
document.addEventListener('keydown', (event) => {
  if (event.key === 's' || event.key === 'm' || event.key === 'u' || event.key === 'r' || event.key === 'f') {
    // Add the pressed key to a string and check if it matches "smurf"
    if (event.key === 's') {
      smurfString = 's';
    } else {
      smurfString += event.key;
    }

    if (smurfString === 'smurf') {
      playSmurfAudio();
    }
  } else {
    smurfString = ''; // Reset the string if a different key is pressed
  }
});

// Variable to store the string as it's being typed
let smurfString = '';


const Polaris = { Settings, Games, Apps, Frame, PolarisError };
export default Polaris;
