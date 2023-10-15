import Theme from './themes.js';
import PolarisError from './error.js';

const isScrollable = (element) => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

class Settings {
    constructor() {
        if (this.get('panic_key')) document.querySelector('#panic_key').value = this.get('panic_key');
        if (this.get('panic_url')) document.querySelector('#panic_url').value = this.get('panic_url');

        if (this.get('cloak')) {
            document.querySelector('#cloak_select').value = this.get('cloak');

            if (this.get('cloak') == 'custom') {
                document.querySelector('#custom_cloak').classList.remove('hidden');

                document.querySelector('#title').addEventListener('input', () => {
                    if (document.querySelector('#title').value) {
                        this.set('cloak_title', document.querySelector('#title').value);
                        document.title = document.querySelector('#title').value;
                    } else document.title = 'Polaris';
                });

                document.querySelector('#domain').addEventListener('input', () => {
                    if (document.querySelector('#domain').value) {
                        this.set('cloak_website', document.querySelector('#domain').value);
                        document.querySelector('link[rel=\'shortcut icon\']').href = 'https://www.google.com/s2/favicons?domain=' + document.querySelector('#domain').value;
                    } else document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
                });

                if (this.get('cloak_title')) {
                    document.querySelector('#title').value = this.get('cloak_title');
                    document.title = this.get('cloak_title');
                }

                if (this.get('cloak_website')) {
                    document.querySelector('#domain').value = this.get('cloak_website');
                    document.querySelector('link[rel=\'shortcut icon\']').href = 'https://www.google.com/s2/favicons?domain=' + this.get('cloak_website');
                }
            } else fetch('/assets/JSON/cloaks.json').then(res => res.json()).then(cloaks => {
                if (cloaks[this.get('cloak')]) {
                    document.title = cloaks[this.get('cloak')].title;
                    document.querySelector('link[rel=\'shortcut icon\']').href = cloaks[this.get('cloak')].icon;
                } else if (this.get('cloak') !== 'none') new PolarisError(`The cloak ${this.get('cloak')} does not exist`);
            });
        }

        fetch('/assets/JSON/cloaks.json').then(res => res.json()).then(cloaks => {
            document.querySelector('#cloak_select').addEventListener('change', () => {
                if (document.querySelector('#cloak_select').value == 'custom') {
                    this.set('cloak', document.querySelector('#cloak_select').value);
                    document.querySelector('#custom_cloak').classList.remove('hidden');

                    document.querySelector('#title').addEventListener('input', () => {
                        if (document.querySelector('#title').value) {
                            this.set('cloak_title', document.querySelector('#title').value);
                            document.title = document.querySelector('#title').value;
                        } else document.title = 'Polaris';
                    });

                    document.querySelector('#domain').addEventListener('input', () => {
                        if (document.querySelector('#domain').value) {
                            this.set('cloak_website', document.querySelector('#domain').value);
                            document.querySelector('link[rel=\'shortcut icon\']').href = 'https://www.google.com/s2/favicons?domain=' + document.querySelector('#domain').value;
                        } else document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
                    });
                } else if (document.querySelector('#cloak_select').value == 'none') {
                    this.set('cloak', document.querySelector('#cloak_select').value);

                    document.title = 'Polaris';
                    document.querySelector('link[rel=\'shortcut icon\']').href = '/favicon.ico';
                    document.querySelector('#custom_cloak').classList.add('hidden');
                } else {
                    if (cloaks[document.querySelector('#cloak_select').value]) {
                        document.title = cloaks[document.querySelector('#cloak_select').value].title;
                        document.querySelector('link[rel=\'shortcut icon\']').href = cloaks[document.querySelector('#cloak_select').value].icon;
                        this.set('cloak', document.querySelector('#cloak_select').value);
                    } else new PolarisError(`The cloak ${document.querySelector('#cloak_select').value} does not exist`);

                    document.querySelector('#custom_cloak').classList.add('hidden');
                }
            });
        });

        document.querySelector('#reset_panic').addEventListener('click', (e) => {
            this.set('panic_key', '');
            document.querySelector('#panic_key').value = 'No Key Selected';
        });

        document.querySelector('#panic_url').addEventListener('input', (e) => {
            this.set('panic_url', document.querySelector('#panic_url').value);
        });

        window.onkeydown = (e) => {
            if (document.querySelector('#panic_key') == document.activeElement) {
                document.querySelector('#panic_key').value = e.key;
                this.set('panic_key', document.querySelector('#panic_key').value);
            } else {
                if (e.key == this.get('panic_key')) {
                    if (this.get('panic_url')) window.location.href = this.get('panic_url');
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

    set = (name, value) => {
        if (!localStorage.getItem('settings')) localStorage.setItem('settings', JSON.stringify({}));
        else {
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

    get = (name) => {
        if (!localStorage.getItem('settings')) localStorage.setItem('settings', JSON.stringify({}));
        else {
            try {
                JSON.parse(localStorage.getItem('settings'));
            } catch (e) {
                localStorage.setItem('settings', JSON.stringify({}));
            }
        }

        const settings = JSON.parse(localStorage.getItem('settings'));
        return settings[name];
    }

    remove = (name) => {
        if (!localStorage.getItem('settings')) localStorage.setItem('settings', JSON.stringify({}));
        else {
            try {
                JSON.parse(localStorage.getItem('settings'));
            } catch (e) {
                localStorage.setItem('settings', JSON.stringify({}));
            }
        }

        const settings = JSON.parse(localStorage.getItem('settings'));
        delete settings[name];
        localStorage.setItem('settings', JSON.stringify(settings));
    }
}

const load = () => {
    new Settings();
};

export { load, Settings };
