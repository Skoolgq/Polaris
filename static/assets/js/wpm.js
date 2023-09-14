/* Stands for Web Prxxy Manager because the keywork Prxxy is usually blocked */

import { dynamicRedirect, worker, workerLoaded } from './dynamic.js';

const load = () => {
    const form = document.querySelector('#wpf');
    const query = document.querySelector('#query');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (typeof navigator.serviceWorker === 'undefined') new PolarisError('Failed to load Prxxy');
        if (!workerLoaded) await worker();

        dynamicRedirect(query.value);
    });
}

export default { load };
