const load = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'f') {
            const iframe = document.querySelector('.frame');

            if (iframe.requestFullscreen) iframe.requestFullscreen();
            else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
            else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
            else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
        }
    });

    const gameID = new URLSearchParams(location.search).get('id');

    fetch('/assets/JSON/games.json')
        .then(res => res.json())
        .then(games => {
            const game = games.find(game => game.id === gameID);

            if (game) {
                const iframe = document.querySelector('.frame');

                iframe.src = game.source;
                document.querySelector('#gameicon').src = game.image;
                document.querySelector('#gametitle').textContent = game.name;
            } else {
                document.querySelector('#gametitle').textContent = 'Failed to load game';
            }
        });

    document.querySelector('#fullscreen').addEventListener('click', () => {
        const iframe = document.querySelector('.frame');

        if (iframe.requestFullscreen) iframe.requestFullscreen();
        else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
        else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
    });

    document.querySelector('#clipboard').addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Game link copied.\nShare it with your friends!")
    });
};

export default { load };
