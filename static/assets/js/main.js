import Theme from '/assets/js/themes.js';

fetch('/assets/misc/nav.html')
    .then(res => res.text())
    .then(content => {
        document.body.insertAdjacentHTML('afterbegin', content);

        if (window.self !== window.top) {
            window.parent.postMessage('loaded', location.origin);
        }
    }).catch(e => {
        alert('Failed to load navbar');

        if (confirm('Try again?')) location.reload();
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
                                console.log(e);

                                if (e.data == 'loaded') {
                                    window.history.pushState({}, '', a.href);
                                    console.log(frame.contentWindow);
                                    document.documentElement.innerHTML = frame.contentWindow.document.documentElement.innerHTML;
                                    document.body.style.display = 'none';

                                    registerLinks();

                                    if (localStorage.getItem('panic_key')) {
                                        document.querySelector('#panic_key').value = localStorage.getItem('panic_key');
                                    }

                                    if (localStorage.getItem('panic_url')) {
                                        document.querySelector('#panic_url').value = localStorage.getItem('panic_url');
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

                                    document.querySelector('#themes').querySelectorAll('button').forEach(el => {
                                        el.onclick = () => {
                                            Theme.set(el.innerText.toLocaleLowerCase());
                                        }
                                    });

                                    document.querySelector('#prevent_close').addEventListener('click', () => {
                                        localStorage.setItem('prevent_close', document.querySelector('#prevent_close').checked);
                                    });

                                    if (localStorage.getItem('prevent_close') == 'true') {
                                        document.querySelector('#prevent_close').checked = true;
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
        if (localStorage.getItem('panic_key')) {
            document.querySelector('#panic_key').value = localStorage.getItem('panic_key');
        }

        if (localStorage.getItem('panic_url')) {
            document.querySelector('#panic_url').value = localStorage.getItem('panic_url');
        }

        document.querySelector('#reset_panic').addEventListener('click', (e) => {
            localStorage.setItem('panic_key', '');
            document.querySelector('#panic_key').value = '';
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

        document.querySelector('#prevent_close').addEventListener('click', () => {
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

        registerLinks();

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
    }, 500);
}