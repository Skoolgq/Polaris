const set = (name, value) => {
  if (!localStorage.getItem('settings')) {
    localStorage.setItem('settings', JSON.stringify({}));
  } else {
    try {
      JSON.parse(localStorage.getItem('settings'));
    } catch (e) {
      localStorage.setItem('settings', JSON.stringify({}));
    }
  }

  const settings = JSON.parse(localStorage.getItem('settings'));
  settings[name] = value;
  localStorage.setItem('settings', JSON.stringify(settings));
};

const get = (name) => {
  if (!localStorage.getItem('settings')) {
    localStorage.setItem('settings', JSON.stringify({}));
  } else {
    try {
      JSON.parse(localStorage.getItem('settings'));
    } catch (e) {
      localStorage.setItem('settings', JSON.stringify({}));
    }
  }

  const settings = JSON.parse(localStorage.getItem('settings'));
  return settings[name];
}

class Theme {
  constructor() {
    this.theme = get('theme');

    if (this.theme) {
      this.set(this.theme);
    } else {
      this.set('system default');
    }
  }

  set = (theme, save) => {
    document.body.setAttribute('data-theme', theme);

    if (save !== false) set('theme', theme);
  }
}

/*let audioPlayed = false;
let smurfString = '';

function playSmurfAudio() {
  if (!audioPlayed) {
    const audio = new Audio('/assets/misc/smurf.mp3');
    audio.play();
    audioPlayed = true;

    const imageElement = document.createElement('img');
    imageElement.src = '/assets/img/smurf.jpg';
    document.body.appendChild(imageElement);

    setTimeout(() => {
      audio.onended = () => {
        document.body.setAttribute('data-theme', 'dark');
        document.body.removeChild(imageElement);

        audioPlayed = false;
      };
    }, 7000);
  }
}

window.addEventListener('keydown', (event) => {
  if (event.key === 's' || event.key === 'm' || event.key === 'u' || event.key === 'r' || event.key === 'f') {
    if (event.key === 's') smurfString = 's';
    else smurfString += event.key;

    if (smurfString === 'smurf') {
      playSmurfAudio();
      smurfString = '';
    }
  } else smurfString = '';
});*/

export default new Theme();