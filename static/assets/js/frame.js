const load = () => {
    let frameData = JSON.parse(localStorage.getItem('frameData'));
    if (!frameData) location.href = '/';

    const iframe = document.querySelector('.frame');

    if (frameData.type === 'game') {
        if (frameData.game) {
            iframe.src = frameData.game.source;
            document.querySelector('#gameicon').src = frameData.game.image;
            document.querySelector('#gametitle').textContent = frameData.game.name;
        } else document.querySelector('#gametitle').textContent = 'Failed to load game.';
    } else if (frameData.type === 'app') {
        if (frameData.app) {
            iframe.src = frameData.app.source;
            document.querySelector('#gameicon').src = frameData.app.image;
            document.querySelector('#gametitle').textContent = frameData.app.name;
        } else document.querySelector('#gametitle').textContent = 'Failed to load app.';
    } else if (frameData.type === 'cheat') {
        if (frameData.cheat) {
            iframe.src = frameData.cheat.source;
            document.querySelector('#gameicon').src = frameData.cheat.image;
            document.querySelector('#gametitle').textContent = frameData.cheat.name;
        } else document.querySelector('#gametitle').textContent = 'Failed to load cheat.';
    }
    else if (frameData.type === 'proxy') {
        if (frameData.source) {
            iframe.src = frameData.source;
            document.querySelector('#gameicon').src = "https://cdn3.iconfinder.com/data/icons/feather-5/24/search-512.png";
            document.querySelector('#gametitle').textContent = "Proxy";
        } else document.querySelector('#gametitle').textContent = 'Failed to load proxy.';
    } else location.href = '/';

    document.querySelector('#fullscreen').addEventListener('click', () => {
        const iframe = document.querySelector('.frame');

        iframe.style.borderRadius = '0px';

        if (iframe.requestFullscreen) iframe.requestFullscreen();
        else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
        else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
    });
};

export default { load };
