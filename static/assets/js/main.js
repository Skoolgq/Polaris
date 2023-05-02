document.querySelectorAll('a').forEach(a => {
    a.onclick = (e) => {
        if (a.dataset.link !== 'true') {
            e.preventDefault();
        }

        if (a.href.startsWith(location.origin)) {
            console.log(location.href);

            if (location.href !== a.href) {
                fetch(a.href)
                    .then(res => res.text())
                    .then(content => {                        
                        setTimeout(() => {
                            console.log('a');

                            window.history.pushState({}, '', a.href);

                            document.documentElement.innerHTML = content;
                        }, 500);
                    }).catch(e => {
                        console.log('c');

                        a.setAttribute('data-link', 'true');
                        a.click();
                    });
            } else {
                alert('whyyyyy');
            }
        } else {
            console.log('d');

            a.setAttribute('data-link', 'true');
            //a.click();
        }
    }
});