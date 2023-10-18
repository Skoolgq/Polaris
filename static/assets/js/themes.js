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

        if (save !== false) {
            set('theme', theme);
        }
    }
}
// Define a variable to track whether the audio has been played
let audioPlayed = false;

// Function to play the audio and display the image
function playSmurfAudio() {
  if (!audioPlayed) {
    const audio = new Audio('/assets/misc/smurf.mp3');
    audio.play();
    audioPlayed = true;

    // Display the image
    const imageElement = document.createElement('img');
    imageElement.src = '/assets/img/smurf.jpg';
    document.body.appendChild(imageElement);

    // Delay theme change by 7 seconds
    setTimeout(() => {
      let themeToggleInterval = setInterval(() => {
        // Toggle between light and dark themes
        if (document.body.getAttribute('data-theme') === 'flamingo') {
          document.body.setAttribute('data-theme', 'light');
        } else {
          document.body.setAttribute('data-theme', 'flamingo');
        }
      }, 300);

      // Stop changing the theme when the audio ends
      audio.onended = () => {
        clearInterval(themeToggleInterval);
        document.body.setAttribute('data-theme', 'dark');
        // Remove the image when the audio ends
        document.body.removeChild(imageElement);
      };
    }, 7000);
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



export default new Theme();