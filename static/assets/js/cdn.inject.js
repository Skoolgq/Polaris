if (window.self === window.top) {
    document.body.style.display = 'none';

    fetch('/404')
        .then(res => res.text())
        .then(data => {
            document.documentElement.innerHTML = data;
            document.body.style.display = 'none';

            try { document.body.dataset.theme = JSON.parse(localStorage.getItem('settings')).theme || 'system-default'; }
            catch {
                document.body.dataset.theme = 'system-default';
                sessionStorage.setItem('settings', JSON.stringify({
                    theme: 'system-default'
                }));
            }

            setTimeout(() => document.body.style.display = 'block', 400);
        });
}