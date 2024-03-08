import { createViewPage, isValidURL, PolarisError, storage } from './utils.js';
import effects from './effects.js';

const settingsStorage = storage('settings');

const load = () => {
    const sortListener = document.querySelector('#searchSort').addEventListener('change', () => {
        settingsStorage.set('game_sort', document.querySelector('#searchSort').value);

        const games = document.querySelectorAll('.games>.game');

        for (let i = 0; i < games.length; i++) games[i].remove();

        fetch('/api/games')
            .then(res => res.json())
            .then(games => {
                if (settingsStorage.get('game_sort') === 'abc') games.all.sort((a, b) => a.name.localeCompare(b.name));
                if (settingsStorage.get('game_sort') === 'newest') games.all.reverse();

                games.all.forEach(game => {
                    const el = document.createElement('div');
                    el.classList = 'game';
                    document.querySelector('.games').appendChild(el);

                    const image = document.createElement('img');
                    image.src = game.image;
                    image.loading = 'lazy';
                    image.onerror = () => image.src = '/assets/img/logo.png';
                    el.appendChild(image);

                    const name = document.createElement('h3');
                    name.textContent = game.name;
                    el.appendChild(name);

                    effects.hoverTilt({
                        max: 8,
                        perspective: 1000,
                        scale: 1.05,
                        speed: 800,
                        easing: 'cubic-bezier(.03,.98,.52,.99)'
                    }, el);

                    el.addEventListener('click', async () => {
                        document.body.style.opacity = '0.7';

                        setTimeout(() => {
                            if (isValidURL(game.target)) createViewPage({
                                target: game.target,
                                title: game.name,
                                proxied: true
                            });
                            else createViewPage({
                                target: game.target,
                                title: game.name
                            });
                        }, 1000);
                    });
                });
            });
    });

    if (!settingsStorage.get('game_sort')) settingsStorage.set('game_sort', 'none');

    document.querySelector('#searchSort').value = settingsStorage.get('game_sort');

    fetch('/api/games')
        .then(res => res.json())
        .then(games => {
            if (settingsStorage.get('game_sort') === 'abc') games.all.sort((a, b) => a.name.localeCompare(b.name));
            if (settingsStorage.get('game_sort') === 'newest') games.all.reverse();

            const searchBar = document.querySelector('#searchInput');

            searchBar.setAttribute('placeholder', `Search ${games.all.length} Games`);

            searchBar.addEventListener('input', () => {
                if (searchBar.value) {
                    var result = false;

                    document.querySelectorAll('.games>.game').forEach(game => {
                        if (game.querySelector('h3').textContent.toLowerCase().includes(searchBar.value.toLowerCase())) {
                            result = true;

                            game.classList.remove('hidden');
                        }
                        else game.classList.add('hidden');
                    });

                    if (result) document.querySelector('.searchErr').classList.add('hidden');
                    else document.querySelector('.searchErr').classList.remove('hidden');
                } else {
                    document.querySelectorAll('.game').forEach(game => game.classList.remove('hidden'));
                    document.querySelector('.searchErr').classList.add('hidden');
                }
            });

            games.popular.forEach(game => {
                const popularEl = document.createElement('div');
                popularEl.classList = 'game';
                document.querySelector('.popular-games').appendChild(popularEl);

                const image = document.createElement('img');
                image.src = game.image;
                image.onerror = () => image.src = '/assets/img/logo.png';
                popularEl.appendChild(image);

                const name = document.createElement('h3');
                name.textContent = game.name;
                popularEl.appendChild(name);

                popularEl.addEventListener('click', async () => {
                    document.body.style.opacity = '0.7';

                    setTimeout(() => {
                        if (isValidURL(game.target)) createViewPage({
                            target: game.target,
                            title: game.name,
                            image: game.image,
                            proxied: true
                        });
                        else createViewPage({
                            target: game.target,
                            title: game.name,
                            image: game.image
                        });
                    }, 500);
                });

                effects.hoverTilt({
                    max: 8,
                    perspective: 1000,
                    scale: 1.05,
                    speed: 800,
                    easing: 'cubic-bezier(.03,.98,.52,.99)'
                }, popularEl);
            });

            games.all.forEach(game => {
                const el = document.createElement('div');
                el.classList = 'game';
                document.querySelector('.games').appendChild(el);

                const image = document.createElement('img');
                image.src = game.image;
                image.onerror = () => image.src = '/assets/img/logo.png';
                el.appendChild(image);

                const name = document.createElement('h3');
                name.textContent = game.name;
                el.appendChild(name);

                effects.hoverTilt({
                    max: 8,
                    perspective: 1000,
                    scale: 1.05,
                    speed: 800,
                    easing: 'cubic-bezier(.03,.98,.52,.99)'
                }, el);

                el.addEventListener('click', async () => {
                    document.body.style.opacity = '0.7';

                    setTimeout(() => {
                        if (isValidURL(game.target)) createViewPage({
                            target: game.target,
                            title: game.name,
                            proxied: true
                        });
                        else createViewPage({
                            target: game.target,
                            title: game.name
                        });
                    }, 1000);
                });
            });
        })
        .catch(e => new PolarisError('Failed to load games'));

    document.querySelector('#randomGame').addEventListener('click', () => {
        const games = document.querySelectorAll('.games>.game');
        
        if (games.length > 0) {
            const randomGame = games[Math.floor(Math.random() * games.length)];

            randomGame.click();
        }
    });

};
const loadGameFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameName = urlParams.get('game');

    if (!gameName) {
        throw new PolarisError('No game specified in the URL');
    }

    fetch('/assets/JSON/games.json')
        .then(res => res.json())
        .then(data => {
            const game = data.find(g => g.name === decodeURIComponent(gameName));

            if (!game) {
                throw new PolarisError(`Game "${gameName}" not found`);
            }

            renderGames([game]);
        })
        .catch(e => new PolarisError('Failed to load game'));
};

export default {
    load,
    loadGameFromURL
};