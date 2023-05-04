import Settings from './settings.js';

window.onerror = (e) => {
    alert(e);
}

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
                                    document.documentElement.innerHTML = frame.contentWindow.document.documentElement.innerHTML;
                                    document.body.style.display = 'none';

                                    Settings.load();
                                    registerLinks();

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
    }, 500);
}