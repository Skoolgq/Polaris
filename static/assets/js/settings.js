import { isScrollable, storage } from './utils.js';
import PolarisError from './error.js';
import Theme from './themes.js';

const settingsStorage = storage('settings');

class Settings {
    constructor() {
        if (settingsStorage.get('panic_key')) document.querySelector('#panic_key').value = settingsStorage.get('panic_key');
        if (settingsStorage.get('panic_url')) document.querySelector('#panic_url').value = settingsStorage.get('panic_url');

        if (settingsStorage.get('cloak')) {
            document.querySelector('#cloak_select').value = settingsStorage.get('cloak');

            if (settingsStorage.get('cloak') == 'custom') {
                document.querySelector('#custom_cloak').classList.remove('hidden');

                document.querySelector('#title').addEventListener('input', () => {
                    if (document.querySelector('#title').value) {
                        settingsStorage.set('cloak_title', document.querySelector('#title').value);
                        document.querySelector('title').dataset.value = document.title;
                        document.title = document.querySelector('#title').value;
                    } else document.title = document.querySelector('title').dataset.value;
                });

                document.querySelector('#domain').addEventListener('input', () => {
                    if (document.querySelector('#domain').value) {
                        settingsStorage.set('cloak_website', document.querySelector('#domain').value);
                        document.querySelector('link[rel=\'shortcut icon\']').href = '/api/favicon?domain=' + document.querySelector('#domain').value;
                    } else document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
                });

                if (settingsStorage.get('cloak_title')) {
                    document.querySelector('#title').value = settingsStorage.get('cloak_title');
                    document.querySelector('title').dataset.value = document.title;
                    document.title = settingsStorage.get('cloak_title');
                }

                if (settingsStorage.get('cloak_website')) {
                    document.querySelector('#domain').value = settingsStorage.get('cloak_website');
                    document.querySelector('link[rel=\'shortcut icon\']').href = '/api/favicon?domain=' + settingsStorage.get('cloak_website');
                }
            } else fetch('/assets/JSON/cloaks.json')
                .then(res => res.json())
                .then(cloaks => {
                    if (cloaks[settingsStorage.get('cloak')]) {
                        document.title = cloaks[settingsStorage.get('cloak')].title;
                        document.querySelector('link[rel=\'shortcut icon\']').href = cloaks[settingsStorage.get('cloak')].icon;
                    } else if (settingsStorage.get('cloak') !== 'none') new PolarisError(`The cloak ${settingsStorage.get('cloak')} does not exist`);
                });
        }

        document.querySelector('#proxy_select').addEventListener('change', () => settingsStorage.set('proxy', document.querySelector('#proxy_select').value));

        if (settingsStorage.get('proxy')) document.querySelector('#proxy_select').value = settingsStorage.get('proxy');

        fetch('/assets/JSON/cloaks.json').then(res => res.json()).then(cloaks => {
            document.querySelector('#cloak_select').addEventListener('change', () => {
                if (document.querySelector('#cloak_select').value == 'custom') {
                    settingsStorage.set('cloak', document.querySelector('#cloak_select').value);
                    document.querySelector('#custom_cloak').classList.remove('hidden');

                    document.querySelector('#title').addEventListener('input', () => {
                        if (document.querySelector('#title').value) {
                            settingsStorage.set('cloak_title', document.querySelector('#title').value);
                            document.querySelector('title').dataset.value = document.title;
                            document.title = document.querySelector('#title').value;
                        } else document.title = document.querySelector('title').dataset.value;
                    });

                    document.querySelector('#domain').addEventListener('input', () => {
                        if (document.querySelector('#domain').value) {
                            settingsStorage.set('cloak_website', document.querySelector('#domain').value);
                            document.querySelector('link[rel=\'shortcut icon\']').href = '/api/favicon?domain=' + document.querySelector('#domain').value;
                        } else document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
                    });
                } else if (document.querySelector('#cloak_select').value == 'none') {
                    settingsStorage.set('cloak', document.querySelector('#cloak_select').value);

                    document.title = document.querySelector('title').dataset.value;
                    document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
                    document.querySelector('#custom_cloak').classList.add('hidden');
                } else {
                    if (cloaks[document.querySelector('#cloak_select').value]) {
                        document.querySelector('title').dataset.value = document.title;
                        document.title = cloaks[document.querySelector('#cloak_select').value].title;
                        document.querySelector('link[rel=\'shortcut icon\']').href = cloaks[document.querySelector('#cloak_select').value].icon;
                        settingsStorage.set('cloak', document.querySelector('#cloak_select').value);
                    } else new PolarisError(`The cloak ${document.querySelector('#cloak_select').value} does not exist`);

                    document.querySelector('#custom_cloak').classList.add('hidden');
                }
            });
        });

        document.querySelector('#reset_panic').addEventListener('click', (e) => {
            settingsStorage.set('panic_key', '');
            document.querySelector('#panic_key').value = 'No Key Selected';
        });

        document.querySelector('#panic_url').addEventListener('input', (e) => {
            settingsStorage.set('panic_url', document.querySelector('#panic_url').value);
        });

        window.onkeydown = (e) => {
            if (document.querySelector('#panic_key') == document.activeElement) {
                document.querySelector('#panic_key').value = e.key;
                settingsStorage.set('panic_key', document.querySelector('#panic_key').value);
            } else {
                if (e.key === settingsStorage.get('panic_key')) {
                    if (settingsStorage.get('panic_url')) window.location.href = settingsStorage.get('panic_url');
                    else new PolarisError('A panic key was used but no url was found.');
                }
            }
        }

        document.querySelector('#themes').querySelectorAll('button').forEach(el => {
            el.onclick = () => Theme.set(el.innerText.toLocaleLowerCase());
        });

        if (window.location.hash.slice(1)) {
            document.querySelector('.sidebar').style.transition = 'all 0s ease';
            document.querySelector('.sidebar').classList.add('active');

            setInterval(() => {
                document.querySelector('.sidebar').removeAttribute('style');
            }, 1000);
        }

        if (sessionStorage.getItem('settings-open') === 'true') {
            document.querySelector('.sidebar').style.transition = 'all 0s ease';
            document.querySelector('.sidebar').classList.add('active');

            setInterval(() => {
                document.querySelector('.sidebar').removeAttribute('style');
            }, 1000);

            window.history.pushState({}, '', '#settings');
        }

        document.querySelectorAll('[data-attr=\'sidebar_trigger\']').forEach(el => {
            el.addEventListener('click', (e) => {
                if (document.querySelector('.sidebar').classList.contains('active')) {
                    document.querySelector('.sidebar').classList.remove('active');

                    setTimeout(() => {
                        window.history.pushState({}, '', location.href.split('#')[0]);
                    }, 50);

                    sessionStorage.setItem('settings-open', false);
                } else {
                    document.querySelector('.sidebar').classList.add('active');
                    sessionStorage.setItem('settings-open', true);
                }
            });
        });

        if (isScrollable(document.querySelector('.sidebar'))) document.querySelector('.scroll').classList.add('active');

        document.querySelector('.scroll').addEventListener('click', () => {
            document.querySelector('.sidebar').scrollTop = document.querySelector('.sidebar').scrollHeight;
        });

        document.querySelector('.sidebar').addEventListener('scroll', () => {
            if (document.querySelector('.sidebar').scrollTop + document.querySelector('.sidebar').clientHeight >= document.querySelector('.sidebar').scrollHeight - 1) document.querySelector('.scroll').classList.remove('active');
            else document.querySelector('.scroll').classList.add('active');
        });
    };
}

const load = () => {
    new Settings();
};

export default { load, Settings };