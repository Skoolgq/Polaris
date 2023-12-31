import { loadProxyWorker, encoder } from './utils.js';

const params = new URLSearchParams(location.search);

window.history.replaceState({}, '', location.pathname);

if (params.get('load')) {
    try {
        const parsedData = JSON.parse(atob(params.get('load')));

        if (Boolean(parsedData.target && parsedData.title && parsedData.return)) {
            document.body.classList.remove('hidden');

            sessionStorage.setItem('loaddata', JSON.stringify(parsedData));

            if (parsedData.proxied) {
                await loadProxyWorker('uv');

                document.querySelector('iframe').src = '/uv/service/' + encoder['xor'].encode(parsedData.target);
            } else document.querySelector('iframe').src = parsedData.target;

            document.querySelector('iframe').addEventListener('load', () => {
                document.querySelector('.title').textContent = parsedData.title;

                document.querySelector('iframe').style.transition = 'none';
                document.querySelector('iframe').style.background = '#fff';
                document.querySelector('iframe').contentWindow.addEventListener('mouseover', () => {
                    document.querySelector('.gamebar').classList.add('collapsed');
                    document.querySelector('.hitbox').classList.remove('active');
                });
                document.querySelector('iframe').contentWindow.addEventListener('mouseout', () => {
                    document.querySelector('.gamebar').classList.remove('collapsed');
                    document.querySelector('.hitbox').classList.add('active');
                });

                if (document.querySelector('iframe').matches(':hover')) setTimeout(() => {
                    document.querySelector('.gamebar').classList.remove('collapsed');
                    document.querySelector('.hitbox').classList.add('active');
                }, 1000);
            });

            document.querySelector('#fullscreen').addEventListener('click', () => {
                const iframe = document.querySelector('iframe');

                if (iframe.requestFullscreen) iframe.requestFullscreen();
                else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
                else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
                else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
            });

            window.addEventListener('fullscreenchange', () => {
                if (document.fullscreenElement) document.querySelector('iframe').style.borderRadius = '0px';
                else document.querySelector('iframe').style.borderRadius = '';
            });

            document.querySelector('#return').addEventListener('click', () => location.href = parsedData.return);
        } else if (parsedData.target && parsedData.redirect === true) {
            window.history.replaceState({}, '', '/redirect');

            if (parsedData.trusted) window.location.replace(parsedData.target);
            else {
                document.documentElement.textContent = `Redirecting to ${parsedData.target}`;
                setTimeout(() => window.location.replace(parsedData.target), 1000);
            }
        } else window.location.replace(parsedData.return || '/');
    } catch (e) { alert(e); window.location.replace('/'); }
} else if (sessionStorage.getItem('loaddata')) window.location.replace(`/view?load=${btoa(sessionStorage.getItem('loaddata'))}`);
else window.location.replace('/');