/**
 * @typedef binding
 * @type {object}
 * @property {() => {}} binding.remove
 */

/**
 * @typedef easterEgg
 * @type {object}
 * @property {'keybind' | 'date'} easterEgg.type
 * @property {string} easterEgg.phrase
 * @property {string} easterEgg.date
 * @property {number} easterEgg.clickCount
 * @property {object} easterEgg.element
 * @property {object} easterEgg.variables
 * @property {(binding: binding, variables: ) => Promise} easterEgg.run
 * @property {() => {}} easterEgg.preload
 */

// REALLY? You're gonna spoil all the easter eggs for yourself? Well, I guess I can't stop you...

const utils = {
    easterEggActive: false,
    /**
     * @param {string} string 
     * @param {easterEgg['run']} script 
     */
    createKeybind: (string, script) => {
        let keybindString = '';

        const listener = window.addEventListener('keydown', async (e) => {
            const chars = string.split('');

            if (chars.includes(e.key)) {
                if (e.key === string.charAt(string.length)) keybindString = string.charAt(string.length);
                else keybindString += e.key;

                if (keybindString === string && !utils.easterEggActive) {
                    utils.easterEggActive = true;

                    try {
                        await script({
                            remove: () => window.removeEventListener('keydown', listener, true)
                        });

                        utils.easterEggActive = false;
                    } catch (e) {
                        utils.easterEggActive = false;
                    }

                    keybindString = '';
                }
            } else keybindString = '';
        });

        return {
            remove: () => window.removeEventListener(listener)
        };
    },
    /**
     * @param {string} date 
     * @param {easterEgg['run']} script 
     */
    createDate: async (date, script) => {
        date = date.split('/');

        if (date.length === 3) {
            const day = date[1] === '*' ? new Date().getDate() : date[1];
            const month = date[0] === '*' ? new Date().getMonth() : date[0];
            const year = date[2] === '*' ? new Date().getFullYear() : date[2];

            if (!utils.easterEggActive && (new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year)) {
                try {
                    await script({
                        remove: () => window.removeEventListener('keydown', listener, true)
                    });

                    utils.easterEggActive = false;
                } catch (e) {
                    utils.easterEggActive = false;
                }
            }
        } else throw new Error('Invalid date');
    }
};

/**
 * @type {Array.<easterEgg>}
 */
const easterEggs = [];

easterEggs.push({
    type: 'keybind',
    phrase: 'smurf',
    run: () => {
        return new Promise((resolve, reject) => {
            const audio = new Audio('/assets/misc/media/smurf.mp3');
            audio.play();

            audio.onplay = () => {
                const imageElement = document.createElement('img');
                imageElement.src = '/assets/img/smurf.jpg';
                imageElement.style = `position: fixed;
                top: 50%;
                left: 50%;
                -ms-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                z-index: 2147483647;
                transition: 0.5s;`;
                document.body.appendChild(imageElement);

                const overlay = document.createElement('div');
                overlay.style = `position: fixed;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                background: black;
                z-index: 2147483646;`;
                document.body.appendChild(overlay);

                var flashInterval;

                setTimeout(() => {
                    for (let i = 0; i < 360 * 3; i++) setTimeout(() => imageElement.style.filter = `hue-rotate(${i > 360 ? i - 360 * Math.trunc(i / 360) : i}deg)`, 20 * i);
                    imageElement.style.animation = '1.06s ease 0s infinite beat';

                    overlay.style.background = 'white';
                    flashInterval = setInterval(() => overlay.style.background = overlay.style.background === 'black' ? 'white' : 'black', 460);
                }, 7330);

                audio.onended = () => {
                    imageElement.remove();
                    overlay.remove();

                    resolve();
                }
            }
        });
    }
});

easterEggs.push({
    type: 'keybind',
    phrase: 'ham',
    run: () => new Promise((resolve, reject) => {
        const audio = new Audio('/assets/misc/media/ringtone.mp3');
        audio.loop = true;
        audio.play();

        audio.onplay = () => {
            const overlay = document.createElement('div');
            overlay.style = `position: fixed;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                background: #000;
                z-index: 2147483645;`;
            document.body.appendChild(overlay);

            const menu = document.createElement('div');
            menu.style = `position: fixed;
                z-index: 2147483646;
                top: 0;
                bottom: 0;
                left: 50%;
                -ms-transform: translate(-50%);
                transform: translate(-50%);
                width: 35%;
                background: rgba(255, 255, 255, 0.1);`;
            document.body.appendChild(menu);

            const caller = document.createElement('div');
            caller.innerHTML = `<img src="/assets/img/hamster.jpg" style="position: fixed;
                width: 37vh;
                height: 37vh;
                object-fit: cover;
                border-radius: 100%;
                top: 10%;
                left: 50%;
                -ms-transform: translate(-50%);
                transform: translate(-50%);"/>
                
                <span style="position: fixed;
                display: block;
                top: calc(37vh + 15%);
                font-size: 5.5vh;
                left: 50%;
                -ms-transform: translate(-50%);
                transform: translate(-50%);">Hamter</span>`;
            menu.appendChild(caller);

            const call = document.createElement('div');
            call.innerHTML = `<img src="/assets/img/hamster.gif" style="position: fixed;
                top: 50%;
                left: 50%;
                height: 100%;
                object-fit: cover;
                width: 100%;
                -ms-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);" />`;

            const buttons = document.createElement('div');
            buttons.style = `position: fixed;
                z-index: 2147483647;
                bottom: 10%;
                left: 50%;
                -ms-transform: translate(-50%);
                transform: translate(-50%);
                width: auto;
                height: auto;
                display: flex;`;
            menu.appendChild(buttons);

            const answer = document.createElement('span');
            answer.style = `width: 5vw;
                height: 5vw;
                display: block;
                background: green;
                display: flex;
                border-radius: 100%;
                cursor: pointer;
                margin-right: 6vh;`;
            answer.innerHTML = `<i class="fa-solid fa-phone" style="font-size: 3vh;
                margin: auto;
                position: relative;"></i>`;
            buttons.appendChild(answer);

            const hangUp = document.createElement('span');
            hangUp.style = `width: 5vw;
                height: 5vw;
                display: block;
                background: red;
                display: flex;
                border-radius: 100%;
                cursor: pointer;`;
            hangUp.innerHTML = `<i class="fa-solid fa-phone-hangup" style="font-size: 3vh;
                margin: auto;
                position: relative;"></i>`;
            buttons.appendChild(hangUp);

            answer.addEventListener('click', () => {
                answer.remove();
                audio.pause();
                audio.remove();
                caller.remove();
                menu.appendChild(call);
            });

            hangUp.addEventListener('click', () => {
                resolve();
                audio.pause();
                audio.remove();
                menu.remove();
                overlay.remove();
            });
        }
    })
});

easterEggs.push({
    type: 'keybind',
    phrase: 'polaris',
    run: () => new Promise((resolve, reject) => {
        document.querySelector('.navbar img').style.animation = 'shake 0.5s';

        setTimeout(() => {
            document.querySelector('.navbar img').style.animation = '';
            resolve();
        }, 500);
    })
});

easterEggs.push({
    type: 'keybind',
    phrase: 'bruh',
    run: () => new Promise((resolve, reject) => {
        const audio = new Audio('/assets/misc/media/bruh.mp3');
        audio.play();

        const trollFace = document.createElement('img');
        trollFace.src = '/assets/img/trollface.png';
        trollFace.style = `position: fixed;
            z-index: 2147483647;
            top: 50%;
            left: 50%;
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            height: 0px;`;

        var sizeInterval;

        audio.onplay = () => {
            document.body.appendChild(trollFace);

            var counter = 1;

            sizeInterval = setInterval(() => {
                trollFace.style.height = `${(100 - counter) * counter}px`;

                counter += 1;
            }, 10);
        };

        audio.onended = () => {
            clearInterval(sizeInterval);
            trollFace.remove();
            resolve();
        };
    })
});

easterEggs.push({
    type: 'keybind',
    phrase: 'rick',
    run: () => new Promise((resolve, reject) => {
        const navbarTitle = document.querySelector('.navbar>a.title');
        const title = navbarTitle.querySelector('span');
        title.innerHTML = 'Rick <span style="">(spam click the logo)</span>';
        const logo = navbarTitle.querySelector('img');
        logo.src = '/assets/img/rick.png';

        var audioPlaying = false;
        var clickTime = 0;
        var clicks = 0;

        const rick = document.createElement('img');
        rick.src = '/assets/img/rick.png';
        rick.style = `position: fixed;
            bottom: -60px;
            right: -60px;
            height: 500px;
            display: block;
            z-index: -99;
            transform: rotate(-30deg);`;
        document.body.appendChild(rick);

        navbarTitle.dataset.action = 'no_redirect';

        const rickClick = navbarTitle.addEventListener('click', (e) => {
            e.preventDefault();

            if ((Date.now() - clickTime) < 500) clicks += 1;
            else clicks = 0;

            if (clicks > 2 && !audioPlaying) {
                clicks = 0;
                clickTime = 0;

                const audio = new Audio('/assets/misc/media/rickroll.mp3');
                audio.play();

                audio.onplay = () => {
                    audioPlaying = true;
                };

                audio.onended = () => {
                    audioPlaying = false;
                    title.innerHTML = 'Polaris <span>by Skool</span>';
                    logo.src = '/assets/img/logo.png';

                    navbarTitle.dataset.action = '';
                    navbarTitle.removeEventListener('click', rickClick);
                    rick.remove();
                    audio.remove();
                    resolve();
                };
            } else clickTime = Date.now();
        });
    })
});

easterEggs.push({
    type: 'keybind',
    phrase: 'skelly',
    run: () => new Promise((resolve, reject) => {
        const imageElement = document.createElement('img');
        imageElement.src = '/assets/img/skelly.gif';
        imageElement.style = `position: fixed;
        top: 50%;
        left: 50%;
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        z-index: 2147483647;
        transition: 0.5s;`;

        const overlay = document.createElement('div');
        overlay.style = `position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: black;
        z-index: 2147483646;`;
        document.body.appendChild(overlay);

        const audio = new Audio('/assets/misc/media/skelly.mp3');
        audio.play();

        audio.onplay = () => {
            document.body.appendChild(imageElement);

            setTimeout(() => {
                audio.pause();
                audio.remove();
                imageElement.remove();
                overlay.remove();
                resolve();
            }, 14000);
        }
    })
});

easterEggs.push({
    type: 'date',
    date: '4/1/*',
    run: () => {
        // April fools =)
    }
});

export default () => easterEggs.forEach(easterEgg => {
    if (easterEgg.type === 'keybind') {
        utils.createKeybind(easterEgg.phrase, easterEgg.run);

        try {
            easterEgg.preload();
        } catch (e) { }
    } else if (easterEgg.type === 'date') {
        utils.createDate(easterEgg.date, easterEgg.run);

        try {
            easterEgg.preload();
        } catch (e) { }
    }
});