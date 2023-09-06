const load = () => {

    fetch('/assets/JSON/games.json')
        .then(res => res.json())
        .then(games => {
            const game = games[Number(new URLSearchParams(location.search).get('id'))];

            if (game) {
                const iframe = document.querySelector('.frame');

                iframe.src = game.source;
                document.querySelector('#gameicon').src = game.image;
                document.querySelector('#gametitle').textContent = game.name;
            } else {
                document.querySelector('#gametitle').textContent = 'Failed to load Game';
            }
        });

    document.querySelector('#fullscreen').addEventListener('click', () => {
        const iframe = document.querySelector('.frame');

        if (iframe.requestFullscreen) iframe.requestFullscreen();
        else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
        else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
    });
};

export default { load };
