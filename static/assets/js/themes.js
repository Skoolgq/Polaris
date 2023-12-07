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

    if (this.theme) this.set(this.theme);
    else this.set('system-default');
  }

  set = (theme, save) => {
    document.body.setAttribute('data-theme', theme);

    if (save !== false) set('theme', theme);
  }
}

let audioPlayed = false;
let smurfString = '';
let currentTheme = new Theme().theme;

const playSmurfAudio = () => {
  if (!audioPlayed) {
    const audio = new Audio('/assets/misc/smurf.mp3');
    audio.play();
    audioPlayed = true;

    const imageElement = document.createElement('img');
    imageElement.src = '/assets/img/smurf.jpg';
    imageElement.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    z-index: 2147483647;
    transition: 0.5s;`;
    document.body.appendChild(imageElement);

    const overlay = document.createElement('div');
    overlay.style = `
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #000;
    z-index: 2147483646;`;
    document.body.appendChild(overlay);

    setTimeout(() => {
      for (let i = 0; i < 360 * 3; i++) setTimeout(() => imageElement.style.filter = `hue-rotate(${i > 360 ? i - 360 * Math.trunc(i / 360) : i}deg)`, 5 * i);
      for (let i = 0; i < 10; i++) setTimeout(() => imageElement.style.height = `${i % 2 ? 'auto' : '120%'}`, i * 525);
    }, 7500);

    audio.onended = () => {
      document.body.setAttribute('data-theme', currentTheme);
      imageElement.remove();
      overlay.remove();

      audioPlayed = false;
    };
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
});

export default new Theme();