import { loadProxyWorker, encoder, storage } from './utils.js';
import { loadSettings } from './settings.js';

loadSettings();

const params = new URLSearchParams(location.search);
const settingsStorage = storage('settings');

window.history.replaceState({}, '', location.pathname);

if (params.get('load')) {
    try {
        const parsedData = JSON.parse(atob(params.get('load')));

        if (Boolean(parsedData.target && parsedData.title && parsedData.return)) {
            document.body.classList.remove('hidden');

            sessionStorage.setItem('loaddata', JSON.stringify(parsedData));

            if (parsedData.proxied) {
                await loadProxyWorker(settingsStorage.get('proxy') || 'uv');

                document.querySelector('#loadframe').src = `/${settingsStorage.get('proxy') || 'uv'}/service/${encoder['xor'].encode(parsedData.target)}`;
            } else document.querySelector('#loadframe').src = parsedData.target;

            document.querySelector('#loadframe').addEventListener('load', () => {
                document.querySelector('.title').textContent = parsedData.title;

                document.querySelector('#loadframe').style.transition = 'none';
                document.querySelector('#loadframe').style.background = '#fff';

                document.querySelector('#loadframe').addEventListener('mouseover', () => {
                    document.querySelector('.gamebar').classList.add('collapsed');
                    document.querySelector('.hitbox').classList.remove('active');
                });

                document.querySelector('#loadframe').addEventListener('mouseout', () => {
                    document.querySelector('.gamebar').classList.remove('collapsed');
                    document.querySelector('.hitbox').classList.add('active');
                });

                setTimeout(() => {
                    document.querySelector('.gamebar').classList.remove('collapsed');
                    document.querySelector('.hitbox').classList.add('active');
                }, 1000);
            });

            document.querySelector('#fullscreen').addEventListener('click', () => {
                const frame = document.querySelector('#loadframe');

                if (frame.requestFullscreen) frame.requestFullscreen();
                else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
                else if (frame.mozRequestFullScreen) frame.mozRequestFullScreen();
                else if (frame.msRequestFullscreen) frame.msRequestFullscreen();
            });

            window.addEventListener('fullscreenchange', () => {
                if (document.fullscreenElement) document.querySelector('#loadframe').style.borderRadius = '0px';
                else document.querySelector('#loadframe').style.borderRadius = '';
            });

            document.querySelector('#return').addEventListener('click', () => {
                document.body.style.opacity = '0.7';

                setTimeout(() => window.location.href = parsedData.return, 500);
            });
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