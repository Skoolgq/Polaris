import Settings from './settings.js';
import Games from './games.js';
import Apps from './apps.js';
import WPM from './wpm.js';
import PolarisError from './error.js';

fetch('/assets/misc/nav.html')
    .then(res => res.text())
    .then(content => {
        document.body.insertAdjacentHTML('afterbegin', content);

        if (window.self !== window.top) {
            window.parent.postMessage('loaded', location.origin);
        }
    }).catch(e => {
        new PolarisError('Failed to load navbar <a href="javascript:location.reload();" data-link="true"><button>Reload</button></a>');
    });

onbeforeunload = (e) => {
    if (localStorage.getItem('prevent_close') === 'true') {
        e.preventDefault();
        return e;
    }
    sessionStorage.clear();
}

const registerLinks = () => {
    document.querySelectorAll('a').forEach(a => {
        a.onclick = (e) => {
            if (a.dataset.link !== 'true') {
                e.preventDefault();

                if (a.href.startsWith(location.origin)) {
                    if (window.location.href !== a.href) {
                        const frame = document.createElement('iframe');
                        frame.src = a.href;
                        frame.style = 'display: none';
                        document.body.appendChild(frame);

                        frame.contentWindow.addEventListener('DOMContentLoaded', () => {
                            document.body.style.display = 'none';

                            window.onmessage = (e) => {
                                if (e.data == 'loaded') {
                                    window.history.pushState({}, '', a.href);
                                    document.documentElement.innerHTML = frame.contentWindow.document.documentElement.innerHTML;
                                    document.body.style.display = 'none';

                                    Settings.load();
                                    registerLinks();

                                    if (location.pathname === '/games') {
                                        Games.load();
                                        const tiltEffectSettings = {
                                          max: 10, // max tilt rotation (degrees (deg))
                                          perspective: 1000, // transform perspective, the lower the more extreme the tilt gets (pixels (px))
                                          scale: 1.05, // transform scale - 2 = 200%, 1.5 = 150%, etc..
                                          speed: 500, // speed (transition-duration) of the enter/exit transition (milliseconds (ms))
                                          easing: 'cubic-bezier(.03,.98,.52,.99)' // easing (transition-timing-function) of the enter/exit transition
                                        };

                                        const games = document.querySelectorAll('.game');

                                        games.forEach(game => {
                                          game.addEventListener('mouseenter', gameMouseEnter);
                                          game.addEventListener('mousemove', gameMouseMove);
                                          game.addEventListener('mouseleave', gameMouseLeave);
                                        });

                                        function gameMouseEnter(event) {
                                          setTransition(event);
                                        }

                                        function gameMouseMove(event) {
                                          const game = event.currentTarget;
                                          const gameWidth = game.offsetWidth;
                                          const gameHeight = game.offsetHeight;
                                          const centerX = game.offsetLeft + gameWidth / 2;
                                          const centerY = game.offsetTop + gameHeight / 2;
                                          const mouseX = event.clientX - centerX;
                                          const mouseY = event.clientY - centerY;
                                          const rotateXUncapped = (+1) * tiltEffectSettings.max * mouseY / (gameHeight / 2);
                                          const rotateYUncapped = (-1) * tiltEffectSettings.max * mouseX / (gameWidth / 2);
                                          const rotateX = rotateXUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
                                            (rotateXUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateXUncapped);
                                          const rotateY = rotateYUncapped < -tiltEffectSettings.max ? -tiltEffectSettings.max :
                                            (rotateYUncapped > tiltEffectSettings.max ? tiltEffectSettings.max : rotateYUncapped);

                                          game.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) 
                                                                  scale3d(${tiltEffectSettings.scale}, ${tiltEffectSettings.scale}, ${tiltEffectSettings.scale})`;
                                        }

                                        function gameMouseLeave(event) {
                                          event.currentTarget.style.transform = `perspective(${tiltEffectSettings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                                          setTransition(event);
                                        }

                                        function setTransition(event) {
                                          const game = event.currentTarget;
                                          clearTimeout(game.transitionTimeoutId);
                                          game.style.transition = `transform ${tiltEffectSettings.speed}ms ${tiltEffectSettings.easing}`;
                                          game.transitionTimeoutId = setTimeout(() => {
                                            game.style.transition = '';
                                          }, tiltEffectSettings.speed);
                                        }

                                    }

                                    if (location.pathname === '/apps') {
                                        Apps.load();
                                    }

                                    if (location.pathname === '/search') {
                                        WPM.load();
                                    }

                                    setTimeout(() => {
                                        document.body.style.display = 'block';
                                    }, 500);
                                }
                            }
                        });
                    }
                } else {
                    a.setAttribute('data-link', 'true');
                    a.click();
                }
            }
        }
    });
}

if (window.self === window.top) {
    setTimeout(() => {
        Settings.load();
        registerLinks();

        if (location.pathname === '/games') {
            Games.load();
        }

        if (location.pathname === '/apps') {
            Apps.load();
        }

        if (location.pathname === '/search') {
            WPM.load();
        }
    }, 500);
}

const Polaris = { Settings, Games, Apps, WPM, PolarisError, registerLinks };

export default Polaris;
