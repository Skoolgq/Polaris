/**
 * @typedef binding
 * @type {object}
 * @property {() => {}} binding.remove
 */

/**
 * @typedef easterEgg
 * @type {object}
 * @property {'keybind' | 'click'} easterEgg.type
 * @property {string} easterEgg.phrase
 * @property {number} easterEgg.clickCount
 * @property {object} easterEgg.element
 * @property {object} easterEgg.variables
 * @property {(binding: binding, variables: ) => Promise} easterEgg.run
 * @property {() => {}} easterEgg.preload
 */

const utils = {
    easterEggActive: false,
    keybindString: '',
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
                    } catch (e) { }

                    keybindString = '';
                }
            } else keybindString = '';
        });

        return {
            remove: () => window.removeEventListener(listener)
        };
    }
};

/**
 * @type {Array.<easterEgg>}
 */
const easterEggs = [];

easterEggs.push({
    type: 'keybind',
    phrase: 'smurf',
    run: (binding, variables) => {
        return new Promise((resolve, reject) => {
            const audio = new Audio('/assets/misc/smurf.mp3');
            audio.play();

            audio.onplay = () => {
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
                    for (let i = 0; i < 360 * 3; i++) setTimeout(() => imageElement.style.filter = `hue-rotate(${i > 360 ? i - 360 * Math.trunc(i / 360) : i}deg)`, 20 * i);
                    imageElement.style.animation = '1.06s ease 0s infinite beat';
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
    phrase: 'polaris',
    run: () => {
        document.querySelector('.navbar img').style.animation = 'shake 0.5s';
        setTimeout(() => document.querySelector('.navbar img').style.animation = '', 500);
    }
});

easterEggs.push({
    type: 'keybind',
    phrase: 'ham',
    run: () => {
        const overlay = document.createElement('div');
        overlay.style = `
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: #000;
        z-index: 2147483645;`;
        document.body.appendChild(overlay);

        const menu = document.createElement('div');
        menu.style = `
        position: fixed;
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
        transform: translate(-50%);">Hamster</span>`;
        menu.appendChild(caller);

        const call = document.createElement('div');
        call.style = ``;
        call.innerHTML = ``;

        const buttons = document.createElement('div');
        buttons.style = `
        position: fixed;
        bottom: 10%;
        left: 50%;
        -ms-transform: translate(-50%);
        transform: translate(-50%);
        width: auto;
        height: auto;
        display: flex;`;
        buttons.innerHTML = `
        <span style="
        width: 5vw;
        height: 5vw;
        display: block;
        background: green;
        display: flex;
        border-radius: 100%;
        cursor: pointer;
        margin-right: 6vh;">
            <i class="fa-solid fa-phone" style="font-size: 3vh;
            margin: auto;
            position: relative;"></i>
        </span>

        <span style="
        width: 5vw;
        height: 5vw;
        display: block;
        background: red;
        display: flex;
        border-radius: 100%;
        cursor: pointer;">
            <i class="fa-solid fa-phone-hangup" style="font-size: 3vh;
            margin: auto;
            position: relative;"></i>
        </span>`;
        menu.appendChild(buttons);

        buttons.querySelectorAll('span')[0].addEventListener('click', () => {
            caller.remove();
            menu.appendChild(call);
        });

        buttons.querySelectorAll('span')[1].addEventListener('click', () => {
            menu.remove();
            overlay.remove();
        });
    }
});

export default () => easterEggs.forEach(easterEgg => {
    if (easterEgg.type === 'keybind') {
        utils.createKeybind(easterEgg.phrase, easterEgg.run);

        try {
            easterEgg.preload();
        } catch (e) { }
    }
});