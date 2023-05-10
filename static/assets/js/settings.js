import Theme from './themes.js';
import PolarisError from './error.js';

const load = () => {
    const isScrollable = (element) => {
        return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
    };

    if (localStorage.getItem('panic_key')) {
        document.querySelector('#panic_key').value = localStorage.getItem('panic_key');
    }

    if (localStorage.getItem('panic_url')) {
        document.querySelector('#panic_url').value = localStorage.getItem('panic_url');
    }

    if (localStorage.getItem('cloak')) {
        document.querySelector('#cloak_select').value = localStorage.getItem('cloak');

        if (localStorage.getItem('cloak') == 'custom') {
            document.querySelector('#custom_cloak').classList.remove('hidden');

            document.querySelector('#title').addEventListener('input', () => {
                if (document.querySelector('#title').value) {
                    localStorage.setItem('cloak_title', document.querySelector('#title').value);
                    document.title = document.querySelector('#title').value;
                } else {
                    document.title = 'Polaris';
                }
            });

            document.querySelector('#domain').addEventListener('input', () => {
                if (document.querySelector('#domain').value) {
                    localStorage.setItem('cloak_website', document.querySelector('#domain').value);

                    document.querySelector('link[rel="shortcut icon"]').href = 'https://www.google.com/s2/favicons?domain=' + document.querySelector('#domain').value;
                } else {
                    document.querySelector('link[rel="shortcut icon"]').href = '/favicon.ico';
                }
            });

            if (localStorage.getItem('cloak_title')) {
                document.querySelector('#title').value = localStorage.getItem('cloak_title');
                document.title = localStorage.getItem('cloak_title');
            }

            if (localStorage.getItem('cloak_website')) {
                document.querySelector('#domain').value = localStorage.getItem('cloak_website');
                document.querySelector('link[rel="shortcut icon"]').href = 'https://www.google.com/s2/favicons?domain=' + localStorage.getItem('cloak_website');
            }
        } else {
            fetch('/assets/JSON/cloaks.json')
                .then(res => res.json())
                .then(cloaks => {
                    if (cloaks[localStorage.getItem('cloak')]) {
                        document.title = cloaks[localStorage.getItem('cloak')].title;
                        document.querySelector('link[rel="shortcut icon"]').href = cloaks[localStorage.getItem('cloak')].icon;
                    } else {
                        new PolarisError(`The theme ${localStorage.getItem('cloak')} does not exist`);
                    }
                });
        }
    }

    fetch('/assets/JSON/cloaks.json')
        .then(res => res.json())
        .then(cloaks => {
            document.querySelector('#cloak_select').addEventListener('change', () => {
                if (document.querySelector('#cloak_select').value == 'custom') {
                    localStorage.setItem('cloak', document.querySelector('#cloak_select').value);

                    document.querySelector('#custom_cloak').classList.remove('hidden');

                    document.querySelector('#title').addEventListener('input', () => {
                        if (document.querySelector('#title').value) {
                            localStorage.setItem('cloak_title', document.querySelector('#title').value);
                            document.title = document.querySelector('#title').value;
                        } else {
                            document.title = 'Polaris';
                        }
                    });

                    document.querySelector('#domain').addEventListener('input', () => {
                        if (document.querySelector('#domain').value) {
                            localStorage.setItem('cloak_website', document.querySelector('#domain').value);

                            document.querySelector('link[rel="shortcut icon"]').href = 'https://www.google.com/s2/favicons?domain=' + document.querySelector('#domain').value;
                        } else {
                            document.querySelector('link[rel="shortcut icon"]').href = '/favicon.ico';
                        }
                    });
                } else if (document.querySelector('#cloak_select').value == 'none') {
                    document.title = 'Polaris';
                    document.querySelector('link[rel="shortcut icon"]').href = '/favicon.ico';

                    document.querySelector('#custom_cloak').classList.add('hidden');
                } else {
                    if (cloaks[document.querySelector('#cloak_select').value]) {
                        document.title = cloaks[document.querySelector('#cloak_select').value].title;
                        document.querySelector('link[rel="shortcut icon"]').href = cloaks[document.querySelector('#cloak_select').value].icon;

                        localStorage.setItem('cloak', document.querySelector('#cloak_select').value);
                    } else {
                        new PolarisError(`The cloak ${document.querySelector('#cloak_select').value} does not exist`);
                    }

                    document.querySelector('#custom_cloak').classList.add('hidden');
                }
            });
        });

    document.querySelector('#reset_panic').addEventListener('click', (e) => {
        localStorage.setItem('panic_key', '');
        document.querySelector('#panic_key').value = 'No Key Selected';
    });

    document.querySelector('#panic_url').addEventListener('input', (e) => {
        localStorage.setItem('panic_url', document.querySelector('#panic_url').value);
    })

    window.onkeydown = (e) => {
        if (document.querySelector('#panic_key') == document.activeElement) {
            document.querySelector('#panic_key').value = e.key;

            localStorage.setItem('panic_key', document.querySelector('#panic_key').value);
        } else {
            if (e.key == localStorage.getItem('panic_key')) {
                if (localStorage.getItem('panic_url')) {
                    window.location.href = localStorage.getItem('panic_url');
                } else {
                    new PolarisError('A panic key was used but no url was found.');
                }
            }
        }
    }

    document.querySelector('#prevent_close').addEventListener('change', () => {
        localStorage.setItem('prevent_close', document.querySelector('#prevent_close').checked);
    });

    if (localStorage.getItem('prevent_close') == 'true') {
        document.querySelector('#prevent_close').checked = true;
    }

    document.querySelector('#themes').querySelectorAll('button').forEach(el => {
        el.onclick = () => {
            Theme.set(el.innerText.toLocaleLowerCase());
        }
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

    document.querySelectorAll('[data-attr="sidebar_trigger"]').forEach(el => {
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

    if (isScrollable(document.querySelector('.sidebar'))) {
        document.querySelector('.scroll').classList.add('active');
    }

    document.querySelector('.scroll').addEventListener('click', () => {
        document.querySelector('.sidebar').scrollTop = document.querySelector('.sidebar').scrollHeight;
    });

    document.querySelector('.sidebar').addEventListener('scroll', () => {
        if (document.querySelector('.sidebar').scrollTop + document.querySelector('.sidebar').clientHeight >= document.querySelector('.sidebar').scrollHeight - 1) {
            document.querySelector('.scroll').classList.remove('active');
        } else {
            document.querySelector('.scroll').classList.add('active');
        }
    });
}

export default { load };