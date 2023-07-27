const gamedata = JSON.parse(localStorage.getItem('gamedata'));

document.getElementById('logo-options').textContent = gamedata.name;
document.getElementById('game-icon-sm').src = gamedata.imgurl;
document.getElementById('game-frame').src = gamedata.gameurl;

const load = (url, name, type) => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'f') fullscreen();
    });

    function fullscreen() {
        let iframe = document.getElementById('game-frame');
        if (!iframe) iframe = document.getElementById('app-frame');

        if (iframe.requestFullscreen) iframe.requestFullscreen();
        else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
        else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
    };
};

export default { load };
