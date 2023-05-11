import PolarisError from './error.js';

const stockSW = '/uv/sw.js';
const swAllowedHostnames = ['localhost', '127.0.0.1'];

async function registerSW() {
    if (
        location.protocol !== 'https:' &&
        !swAllowedHostnames.includes(location.hostname)
    )
        new PolarisError('Service workers cannot be registered without https.');

    if (!navigator.serviceWorker)
    new PolarisError(`Your browser doesn't support service workers.`);

    await navigator.serviceWorker.register(stockSW, {
        scope: __uv$config.prefix,
    });
}

export default { registerSW };