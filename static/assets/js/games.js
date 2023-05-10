import PolarisError from './error.js';

const load = () => {
    fetch('/assets/JSON/games.json')
        .then(res => res.json())
        .then(games => {
            games.forEach(game => {
                const el = document.createElement('div');
                el.classList = 'game';
                el.innerHTML = `<img src="${game.image}"><h3>${game.name}</h3><span>${game.desc}</span>`;
                document.querySelector('.games').appendChild(el);

                el.addEventListener('click', () => {
                    
                });
            });
        }).catch(e => {
            new PolarisError('Failed to load games');
        });
}

export default { load };
