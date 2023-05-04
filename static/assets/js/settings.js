import Theme from './themes.js';

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
                    alert('A panic key was used but no url was found');
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