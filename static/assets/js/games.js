import { createViewPage, isValidURL, PolarisError } from './utils.js';
import effects from './effects.js';

const load = () => {
    fetch('/api/games')
        .then(res => res.json())
        .then(games => {
            const searchBar = document.querySelector('#searchInput');

            searchBar.setAttribute('placeholder', `Search ${games.all.length} Games`);

            searchBar.addEventListener('input', () => {
                console.log(searchBar.value);

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
                image.loading = 'lazy';
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
                            proxied: true
                        });
                        else createViewPage({
                            target: game.target,
                            title: game.name
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
                    }, 500);
                });
            });
        })
        .catch(e => new PolarisError('Failed to load games'));
};

export default {
    load
};