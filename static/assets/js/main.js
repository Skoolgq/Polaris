import Settings from './settings.js';
import Games from './games.js';
import Apps from './apps.js';
import Frame from './frame.js';
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
        new PolarisError('Failed to load navbar <a href="" onclick"javascript:location.reload();" data-link="true"><button>Reload</button></a>');
    });

onbeforeunload = (e) => {
    if (localStorage.getItem('prevent_close') === 'true') {
        e.preventDefault();
        return e;
    }
    sessionStorage.clear();
}

var previousLocation = location.pathname;

const urlchange = setInterval(() => {
    if (location.pathname !== previousLocation) {

    }

    previousLocation = location.pathname;
}, 1);

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

        if (location.pathname === '/play') {
            Frame.load();
        }
    }, 500);
}

const Polaris = { Settings, Games, Apps, WPM, PolarisError, registerLinks };

export default Polaris;