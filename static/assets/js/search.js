import { createViewPage, isValidURL } from './utils.js';

const load = async () => {
    const form = document.querySelector('#wpf');
    const query = document.querySelector('#query');
    const response = await fetch('./JSON/blacklist.json');
    const blacklist = await response.json();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // blacklist stuff :)
        if (containsBlacklistedTerm(query.value, blacklist)) {
            alert('This search contains a blacklisted term. Please keep it appropriate, thanks!');
            return;
        }

        const url = isValidURL(query.value) ? ((!query.value.startsWith('http://') && !query.value.startsWith('https://')) ? 'https://' + query.value : query.value) : 'https://www.google.com/search?q=' + encodeURIComponent(query.value);

        document.body.style.opacity = '0.7';

        umami.track('query-' + query.value);

        setTimeout(() => createViewPage({
            target: url,
            proxied: true,
            title: 'Proxy'
        }), 500);
    });
}

// helper for blacklist
const containsBlacklistedTerm = (value, blacklist) => {
    return blacklist.some(entry => value.includes(entry));
}

export default { load };
