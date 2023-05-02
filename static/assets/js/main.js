import * as theme from '/assets/js/themes.js';
/*Please link all javascript files here using import*/

//Someone should put this code somewhere
document.querySelectorAll('a').forEach(a => {
    a.onclick = (e) => {
        if (a.dataset.link !== 'true') {
            e.preventDefault();
        }

        if (a.href.startsWith(location.origin)) {
            fetch(a.href)
                .then(res => res.text())
                .then(content => {
                    setTimeout(() => {
                        console.log('a');

                        window.history.pushState({}, '', a.href);

                        document.documentElement.innerHTML = content;
                    }, 500);
                }).catch(e => {
                    a.setAttribute('data-link', 'true');
                    a.click();
                });
        } else {
            a.setAttribute('data-link', 'true');
            a.click();
        }
    }
});