import Theme from '/assets/js/themes.js';

var loaded = false;

fetch('/assets/misc/nav.html')
    .then(res => res.text())
    .then(content => {
        document.body.insertAdjacentHTML('afterbegin', content);

        loaded = true;
    }).catch(e => {
        alert('Failed to load navbar');

        if (confirm('Try again?')) location.reload();
    });

onbeforeunload = (e) => {
    return e;
}

const registerLinks = () => {
    document.querySelectorAll('a').forEach(a => {
        a.onclick = (e) => {
            if (a.dataset.link !== 'true') {
                e.preventDefault();
            }

            if (a.href.startsWith(location.origin)) {
                if (window.location.href !== a.href) {
                    const frame = document.createElement('iframe');
                    frame.src = a.href;
                    frame.style = 'display: none';
                    document.body.appendChild(frame);

                    frame.contentWindow.addEventListener('DOMContentLoaded', () => {
                        document.body.style.display = 'none';

                        setTimeout(() => {
                            window.history.pushState({}, '', a.href);
                            document.documentElement.innerHTML = frame.contentDocument.documentElement.innerHTML;
                            document.body.style.display = 'none';

                            registerLinks();

                            setTimeout(() => {
                                document.body.style.display = 'block';
                            }, 100);
                        }, 500);
                    });
                }
            } else {
                alert('buh');

                a.setAttribute('data-link', 'true');
                a.click();
            }
        }
    });
}

if (window.self === window.top) {
    const load = setInterval(() => {
        if (loaded) {
            clearInterval(load);

            registerLinks();
        }
    }, 100);
}