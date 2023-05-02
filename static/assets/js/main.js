import Theme from '/assets/js/themes.js';
/*Please link all javascript files here using import*/

console.log(Theme);

fetch('/assets/misc/nav.html')
    .then(res => res.text())
    .then(content => {
        document.body.insertAdjacentHTML('afterbegin', content);
    }).catch(e => {
        alert('Failed to load navbar');

        if (confirm('Try again?')) location.reload();
    })

/*setTimeout(() => {
    document.querySelectorAll('a').forEach(a => {
        a.onclick = (e) => {
            if (a.dataset.link !== 'true') {
                e.preventDefault();
            }

            if (a.href.startsWith(location.origin)) {
                if (window.location.href !== a.href) {
                    fetch(a.href)
                        .then(res => res.text())
                        .then(content => {
                            setTimeout(() => {
                                window.history.pushState({}, '', a.href);

                                document.documentElement.innerHTML = content;
                            }, 500);
                        }).catch(e => {
                            a.setAttribute('data-link', 'true');
                            a.click();
                        });
                }
            } else {
                a.setAttribute('data-link', 'true');
                a.click();
            }
        }
    });
}, 500)*/